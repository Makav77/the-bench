package org.example;
import org.example.scraping.Scraper;
import org.example.db.DatabaseManager;
import java.util.List;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.example.version.UpdateChecker;
import org.example.version.VersionUtil;

public class GUI extends Application {
    @Override
    public void start(Stage stage) throws Exception {
        String localVersion = VersionUtil.getLocalVersion();
        UpdateChecker.checkForUpdate();
        System.out.println("Local version: " + localVersion);
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/ui/main.fxml"));
        Scene scene = new Scene(fxmlLoader.load());
        stage.setTitle("The bench");
        stage.setScene(scene);
        stage.setMinWidth(1000);
        stage.setMinHeight(700);
        stage.show();
    }
}
