package org.example;
import org.example.controller.MainController;
import org.example.scraping.Scraper;
import org.example.db.DatabaseManager;

import java.io.File;
import java.util.List;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.example.theme.ThemeManager;
import org.example.version.UpdateChecker;
import org.example.version.VersionUtil;

public class GUI extends Application {
    @Override
    public void start(Stage stage) throws Exception {
        // Créer le dossier /plugins s'il n'existe pas
        File pluginDir = new File("plugins");
        if (!pluginDir.exists()) {
            pluginDir.mkdirs();
        }
        String localVersion = VersionUtil.getLocalVersion();
        UpdateChecker.checkForUpdate();
        System.out.println("Local version: " + localVersion);
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
}
