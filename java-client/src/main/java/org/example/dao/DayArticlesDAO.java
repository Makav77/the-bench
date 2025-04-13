package org.example.dao;

import org.example.db.DatabaseManager;
import org.example.scraping.Article;
import org.example.scraping.DayArticles;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;


public class DayArticlesDAO {
    public DayArticlesDAO() throws SQLException {
        try(Connection conn  = DatabaseManager.getConnection(); Statement stmt = conn.createStatement();){
            stmt.execute("CREATE TABLE IF NOT EXISTS day_articles (id INTEGER PRIMARY KEY AUTOINCREMENT, day DATE NOT NULL)");
        }
        catch (SQLException e) {
            System.err.println("Erreur lors de la création de la table : " + e.getMessage());
        }
    }

    public int insertDayArticles(DayArticles dayArticles) throws SQLException {
        String sql = "INSERT INTO day_articles (day) VALUES (?)";
        int generatedId = -1;

        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setDate(1, Date.valueOf(dayArticles.day));
            pstmt.executeUpdate();

            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    generatedId = rs.getInt(1);
                }
            }

        } catch (SQLException e) {
            System.err.println("Erreur lors de l'insertion : " + e.getMessage());
        }

        return generatedId;
    }


    public List<DayArticles> getAllDayArticles() throws SQLException {
        List<DayArticles> dayArticlesList = new ArrayList<>();
        String sql = "SELECT * FROM day_articles";
        try (Connection conn = DatabaseManager.getConnection(); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Date date = rs.getDate("day");
                LocalDate localDate = date.toLocalDate();
                DayArticles dayArticles = new DayArticles(localDate, new ArrayList<Article>());
                dayArticlesList.add(dayArticles);
            }
        } catch (SQLException e) {
            System.err.println("Erreur lors de la récupération des articles : " + e.getMessage());
        }
        return dayArticlesList;
    }
}
