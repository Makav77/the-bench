package org.example;
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

public class Main extends Application {
    @Override
    public void start(Stage stage) throws Exception {
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/ui/main.fxml"));
        Scene scene = new Scene(fxmlLoader.load());
        stage.setTitle("The bench");
        stage.setScene(scene);
        stage.setMinWidth(1000);
        stage.setMinHeight(700);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}