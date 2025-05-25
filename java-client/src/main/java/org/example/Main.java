package org.example;
import org.example.controller.JournalController;
import org.example.dao.DayArticlesDAO;
import org.example.scraping.DayArticles;
import org.example.scraping.DayArticlesUtils;
import org.example.scraping.Scraper;
import org.example.db.DatabaseManager;
import java.util.List;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class Main{

    public static void main(String[] args) {
        GUI.launch(GUI.class, args);
    }
}