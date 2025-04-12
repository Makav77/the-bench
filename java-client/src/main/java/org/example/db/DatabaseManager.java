package org.example.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseManager {
    private static final String DB_PATH = "data/TheBench.db";
    public static Connection connection;

    public static void getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            new java.io.File("data").mkdirs();
            connection = DriverManager.getConnection("jdbc:sqlite:" + DB_PATH);
        }
    }
    public static void closeConnection() throws SQLException {
        try{
            if (connection != null && !connection.isClosed()) {
                connection.close();
            }
        } catch (SQLException e) {
            System.err.println("Erreur lors de la fermeture de la connexion : " + e.getMessage());
        }
    }
}
