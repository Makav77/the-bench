package org.example;
import org.example.controller.MainController;

import java.io.File;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.example.theme.ThemeManager;
import org.example.version.UpdateChecker;
import org.example.version.VersionUtil;

public class GUI extends Application {
    @Override
    public void start(Stage stage) throws Exception {
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
        stage.setTitle("The Bench");
        stage.getIcons().add(
                new javafx.scene.image.Image(getClass().getResourceAsStream("/ui/icons/app_logo_transparent.png"))
        );
        stage.setScene(scene);
        stage.setMinWidth(1000);
        stage.setMinHeight(700);
        stage.show();
        MainController controller = fxmlLoader.getController();
        controller.loadPlugins();
    }
}
