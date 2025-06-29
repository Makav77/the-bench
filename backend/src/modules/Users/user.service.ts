import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './entities/user.entity';
import bcrypt from "bcryptjs";
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Event } from '../Events/entities/event.entity';
import { ChallengeRegistration } from '../Challenges/entities/challenge-registration.entity';
import { MarketItem } from '../Market/entities/market.entity';
import { ProfileSummaryDTO } from './dto/profile-summary.dto';
import { IrisService } from '../Iris/iris.service';
import axios from 'axios';

type IrisInfo = { irisCode: string; irisName: string; };

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        @InjectRepository(ChallengeRegistration)
        private readonly challengeRegistrationRepository: Repository<ChallengeRegistration>,
        @InjectRepository(MarketItem)
        private readonly marketItemRepository: Repository<MarketItem>,
        private readonly irisService: IrisService,
    ) { }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }
        return user;
    }

    async searchUsers(query: string): Promise<{ id: string; firstname: string; lastname: string; }[]> {
        return this.userRepository
            .createQueryBuilder("user")
            .where('LOWER(user.firstname) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('LOWER(user.lastname) LIKE LOWER(:query)', { query: `%${query}%` })
            .select(['user.id', 'user.firstname', 'user.lastname'])
            .limit(10)
            .getMany();
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ email });
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found.`);
        }
        return user;
    }

    async create(createUserDTO: CreateUserDTO): Promise<User> {
        try {
            createUserDTO.password = await bcrypt.hash(createUserDTO.password, 10);

            if (!createUserDTO.irisCode || !createUserDTO.irisName) {
                throw new ConflictException("Missing IRIS neighborhood info. Please verify the address.")
            }

            const user = this.userRepository.create({
                ...createUserDTO,
                profilePicture: "/uploads/profile/default.png",
            });

            return await this.userRepository.save(user);
        } catch (error) {
            if (error.code === "23505") {
                throw new ConflictException("Un utilisateur avec cet email existe déjà.");
            }
            throw error;
        }
    }

    async update(id: string, updateUserDTO: UpdateUserDTO): Promise<User> {
        const user = await this.findOne(id);
        if (updateUserDTO.address && updateUserDTO.address != user.address) {
            const irisInfo = await this.getIrisFromAddress(updateUserDTO.address);
            if (!irisInfo) {
                throw new ConflictException("Unable to link the new address to a Paris neighborhood (IRIS). Please verify the address.")
            }
            updateUserDTO.irisCode = irisInfo.irisCode;
            updateUserDTO.irisName = irisInfo.irisName;
        }

        const updated = this.userRepository.merge(user, updateUserDTO);
        return this.userRepository.save(updated);
    }

    async remove(id: string): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }
        return;
    }

    async getProfileSummary(userId: string, currentUserId?: string): Promise<ProfileSummaryDTO> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });

            if (!user) {
                console.log("No user found for userId:", userId);
                throw new NotFoundException("User not found.");
            }

            const events = await this.eventRepository
                .createQueryBuilder("event")
                .leftJoin("event.participantsList", "participant")
                .where("participant.id = :userId", { userId })
                .orderBy("event.startDate", "DESC")
                .getMany();

            const eventSummaries = events.map(event => ({
                id: event.id,
                name: event.name,
                startDate: event.startDate,
            }));

            const registrations = await this.challengeRegistrationRepository.find({
                relations: ["challenge"],
                where: { user: { id: userId } },
            });

            const challengeSummaries = registrations.map(r => ({
                id: r.challenge.id,
                title: r.challenge.title,
                startDate: r.challenge.startDate,
            }));

            const marketItems = await this.marketItemRepository.find({
                where: { author: { id: userId } },
                order: { updatedAt: "DESC" }
            });

            const marketItemSummaries = marketItems.map(item => ({
                id: item.id,
                title: item.title,
                updatedAt: item.updatedAt,
                images: item.images ?? [],
            }));

            const profileSummary: ProfileSummaryDTO = {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                profilePictureUrl: user.profilePicture || "/uploads/profile/default.png",
                badges: [],
                points: user.points,
                events: eventSummaries,
                challenges: challengeSummaries,
                marketItems: marketItemSummaries,
            };

            if (currentUserId && currentUserId !== userId) {
                const status = await this.getFriendStatus(currentUserId, userId);
                profileSummary.isFriend = status.areFriends;
                profileSummary.requestSent = status.requestSent;
                profileSummary.requestReceived = status.requestReceived;
                return { ...profileSummary, ...status };
            }

            return profileSummary;
        } catch (err) {
            console.error("Error in getProfileSummary:", err);
            throw err;
        }
    }

    async setProfilePicture(userId: string, path: string): Promise<User> {
        const user = await this.findOne(userId);
        user.profilePicture = path;
        return this.userRepository.save(user);
    }

    async getFriends(userId: string): Promise<{ id: string; firstname: string; lastname: string; profilePicture: string }[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ["friends"],
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user.friends.map(friend => ({
            id: friend.id,
            firstname: friend.firstname,
            lastname: friend.lastname,
            profilePicture: friend.profilePicture,
        }));
    }

    async sendFriendRequest(fromId: string, toId: string): Promise<void> {
        if (fromId === toId) {
            throw new ConflictException("You cannot add yourself as a friend.");
        }

        const fromUser = await this.userRepository.findOne({
            where: { id: fromId },
            relations: ["friends", "friendRequestsSent"],
        });
        const toUser = await this.userRepository.findOneBy({ id: toId });

        if (!fromUser || !toUser) {
            throw new NotFoundException("User not found.");
        }

        if (fromUser.friends.some(f => f.id === toId)) {
            throw new ConflictException("Already friends.");
        }

        if (fromUser.friendRequestsSent.some(r => r.id === toId)) {
            throw new ConflictException("Friend request already sent.");
        }

        fromUser.friendRequestsSent.push(toUser);
        await this.userRepository.save(fromUser);
    }

    async acceptFriendRequest(userId: string, requesterId: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ["friendRequestsReceived", "friends"],
        })
        const requester = await this.userRepository.findOne({
            where: { id: requesterId },
            relations: ["friendRequestsSent", "friends"],
        });

        if (!user || !requester) {
            throw new NotFoundException("User not found");
        }

        if (!user.friendRequestsReceived.some(r => r.id === requesterId)) {
            throw new ConflictException("No pending request from this user.");
        }

        user.friendRequestsReceived = user.friendRequestsReceived.filter(r => r.id !== requesterId);
        requester.friendRequestsSent = requester.friendRequestsSent.filter(r => r.id !== userId);

        user.friends.push(requester);
        requester.friends.push(user);

        await this.userRepository.save(user);
        await this.userRepository.save(requester);
    }

    async rejectFriendRequest(currentUserId: string, senderId: string): Promise<void> {
        const currentUser = await this.userRepository.findOne({
            where: { id: currentUserId },
            relations: ["friendRequestsReceived"],
        })
        const sender = await this.userRepository.findOne({
            where: { id: senderId },
            relations: ["friendRequestsSent"],
        });

        if (!currentUser || !sender) {
            throw new NotFoundException("User not found");
        }

        currentUser.friendRequestsReceived = currentUser.friendRequestsReceived.filter((u) => u.id !== senderId);
        sender.friendRequestsSent = sender.friendRequestsSent.filter((u) => u.id !== currentUserId);

        await this.userRepository.save([currentUser, sender]);
    }

    async removeFriend(userId: string, friendId: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ["friends"],
        });
        const friend = await this.userRepository.findOne({
            where: { id: friendId },
            relations: ["friends"],
        });

        if (!user || !friend) {
            throw new NotFoundException("User not found");
        }

        user.friends = user.friends.filter(f => f.id !== friendId);
        friend.friends = friend.friends.filter(f => f.id !== userId);

        await this.userRepository.save(user);
        await this.userRepository.save(friend);
    }

    async getFriendStatus(currentUserId: string, targetUserId: string): Promise<{ areFriends: boolean; requestSent: boolean; requestReceived: boolean; }> {
        const currentUser = await this.userRepository.findOne({
            where: { id: currentUserId },
            relations: ["friends", "friendRequestsSent", "friendRequestsReceived"],
        });

        if (!currentUser) {
            throw new NotFoundException("Current user not found");
        }

        return {
            areFriends: currentUser.friends.some((u) => u.id === targetUserId),
            requestSent: currentUser.friendRequestsSent.some((u) => u.id === targetUserId),
            requestReceived: currentUser.friendRequestsReceived.some((u) => u.id === targetUserId),
        };
    }

    async getIrisFromAddress(address: string): Promise<IrisInfo | null> {
        try {
            const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`;
            const response = await axios.get(url);
            const features = response.data.features;

            if (features && features.length > 0 && features[0].properties && features[0].properties.iris && features[0].properties.iris_name) {
                return {
                    irisCode: features[0].properties.iris,
                    irisName: features[0].properties.iris_name
                };
            }
            return null;
        } catch (error) {
            console.error("Error while get IRIS : " + error);
            return null;
        }
    }

    async updateAddress(userId: string, street: string, postalCode: string, city: string) {
        if (!street || !postalCode || !city) {
            throw new BadRequestException("All fields must be entered.");
        }

        const { irisCode, irisName } = await this.irisService.resolveIris(street, postalCode, city);

        const address = `${street}, ${postalCode} ${city}`.trim();

        await this.userRepository.update(userId, {
            address,
            irisCode,
            irisName,
        });

        return { irisCode, irisName };
    }

    async getStaff(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException("Utilisateur non trouvé");
        }

        const admins = await this.userRepository.find({
            where: { role: Role.ADMIN }
        });

        const moderators = await this.userRepository.find({
            where: { role: Role.MODERATOR, irisCode: user.irisCode }
        });

        console.log("--------------------------------------------------------------userId:", userId);
        console.log("--------------------------------------------------------------User trouvé:", user);
        console.log("--------------------------------------------------------------All users:", await this.userRepository.find());
        console.log("--------------------------------------------------------------Admins trouvés:", admins);
        console.log("--------------------------------------------------------------Moderators trouvés:", moderators);

        return {
            admins: admins.map(u => ({
                id: u.id,
                firstname: u.firstname,
                lastname: u.lastname,
                profilePicture: u.profilePicture,
            })),
            moderators: moderators.map(u => ({
                id: u.id,
                firstname: u.firstname,
                lastname: u.lastname,
                profilePicture: u.profilePicture,
            }))
        };
    }
}
