package org.example.dao;

import org.example.db.DatabaseManager;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;
import java.sql.ResultSet;

import org.example.scraping.Article;

public class ArticlesDAO {
    public ArticlesDAO() {
        try(Connection conn  = DatabaseManager.getConnection(); Statement stmt = conn.createStatement();){
            stmt.execute("CREATE TABLE IF NOT EXISTS articles ( id INTEGER PRIMARY KEY AUTOINCREMENT, day_id INTEGER NOT NULL, time TEXT NOT NULL, title TEXT NOT NULL, FOREIGN KEY(day_id) REFERENCES day_articles(id), UNIQUE(day_id, title) );");
        }
        catch (SQLException e) {
            System.err.println("Erreur lors de la création de la table : " + e.getMessage());
        }
    }

    public void insertArticle(Article article, int dayId) {
        String sql = "INSERT OR IGNORE INTO articles (day_id, time, title) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseManager.getConnection(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, dayId);
            pstmt.setString(2, article.time);
            pstmt.setString(3, article.title);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Erreur lors de l'insertion : " + e.getMessage());
        }
    }

    public List<Article> getArticlesByDayId(int dayId) {
        List<Article> articles = new ArrayList<Article>();
        String sql = "SELECT * FROM articles WHERE day_id = ?";
        try (Connection conn = DatabaseManager.getConnection(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, dayId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                String time = rs.getString("time");
                String title = rs.getString("title");
                articles.add(new Article(time, title));
            }
        } catch (SQLException e) {
            System.err.println("Erreur lors de la récupération des articles : " + e.getMessage());
        }
        return articles;
    }
}
