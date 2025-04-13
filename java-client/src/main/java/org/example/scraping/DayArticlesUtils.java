package org.example.scraping;

import org.example.dao.ArticlesDAO;
import org.example.dao.DayArticlesDAO;

import java.lang.reflect.Array;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class DayArticlesUtils {
    public static LocalDate resolveDayNameToDate(String dayNameFr, LocalDate today) {
        Map<String, DayOfWeek> frenchToEnum = Map.of(
                "LUNDI", DayOfWeek.MONDAY,
                "MARDI", DayOfWeek.TUESDAY,
                "MERCREDI", DayOfWeek.WEDNESDAY,
                "JEUDI", DayOfWeek.THURSDAY,
                "VENDREDI", DayOfWeek.FRIDAY,
                "SAMEDI", DayOfWeek.SATURDAY,
                "DIMANCHE", DayOfWeek.SUNDAY
        );

        DayOfWeek targetDay = frenchToEnum.get(dayNameFr.toUpperCase());
        if (targetDay == null) {
            throw new IllegalArgumentException("Jour inconnu : " + dayNameFr);
        }

        DayOfWeek todayDay = today.getDayOfWeek();
        int diff = targetDay.getValue() - todayDay.getValue();

        if (diff > 0) {
            return today.minusDays(7 - diff); // jour dans la semaine dernière
        } else {
            return today.plusDays(diff); // jour cette semaine ou aujourd'hui (plus day car diff est négatif ou 0)
        }
    }

    public static void printDayArticles(List<DayArticles> dayArticles) {
        for(DayArticles day : dayArticles) {
            System.out.println("Jour : " + day.day);
            for (Article article : day.articles) {
                System.out.println("  " + article.time + " - " + article.title);
            }
        }
    }

    public static void InsertDayArticles(List<DayArticles> dayArticles) {
        try {
            DayArticlesDAO dayArticlesDAO = new DayArticlesDAO();
            ArticlesDAO articlesDAO = new ArticlesDAO();
            for (DayArticles dayArticle : dayArticles) {
                int idDayArticles =  dayArticlesDAO.insertDayArticles(dayArticle);
                for (Article article : dayArticle.articles) {
                    articlesDAO.insertArticle(article, idDayArticles);
                }
            }
        }
        catch (Exception e) {
            System.err.println("Erreur lors de l'insertion des articles : " + e.getMessage());
        }
    }
}
