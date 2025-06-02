package org.example;
import org.example.controller.JournalController;
import org.example.controller.MainController;
import org.example.dao.DayArticlesDAO;
import org.example.plugin.PluginLoader;
import org.example.scraping.DayArticles;
import org.example.scraping.DayArticlesUtils;
import org.example.scraping.Scraper;
import org.example.db.DatabaseManager;

import java.io.File;
import java.util.List;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.example.theme.ThemeManager;




public class Main{
    public void start(Stage stage) throws Exception {
        // Créer le dossier /plugins s'il n'existe pas
        File pluginDir = new File("plugins");
        if (!pluginDir.exists()) {
            pluginDir.mkdirs();
        }

        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/ui/main.fxml"));
        Scene scene = new Scene(fxmlLoader.load());
        ThemeManager.loadThemeFromConfig(scene);

        stage.setTitle("The bench");
        stage.setScene(scene);
        stage.setMinWidth(1000);
        stage.setMinHeight(700);
        stage.show();

        MainController controller = fxmlLoader.getController();
        controller.loadPlugins();
    }

    public static void main(String[] args) {
        GUI.launch(GUI.class, args);
    }
}