package org.example.controller;

import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.layout.*;
import org.example.scraping.Article;
import org.example.scraping.DayArticles;
import org.example.scraping.DayArticlesUtils;
import org.example.scraping.Scraper;

import java.util.List;

public class JournalController {

    @FXML
    private VBox articleContainer;
    @FXML private Button updateButton;
    @FXML private ProgressIndicator spinner;

    @FXML
    private void initialize() {
        System.out.println("Vue JournalController chargée !");
        List<DayArticles> dayArticlesList = DayArticlesUtils.getAllDayArticles();
        dayArticlesList = dayArticlesList.stream().sorted(
                (a, b) -> b.day.compareTo(a.day)
        ).toList();
        displayDayArticles(dayArticlesList);
        updateButton.setOnAction(e -> updateDayArticles());
    }

    public void addArticle(String title, String content) {
        VBox articleBox = new VBox();
        articleBox.setSpacing(5);
        articleBox.setStyle("-fx-background-color: #4A5568; -fx-padding: 10; -fx-background-radius: 5;");

        Label titleLabel = new Label(title);
        titleLabel.setStyle("-fx-text-fill: #ffffff; -fx-font-size: 16; -fx-font-weight: bold;");

        Label contentLabel = new Label(content);
        contentLabel.setStyle("-fx-text-fill: #d1d5db; -fx-font-size: 12;");

        articleBox.getChildren().addAll(titleLabel, contentLabel);
        articleContainer.getChildren().add(articleBox);
    }

    public void displayDayArticles(List<DayArticles> dayArticlesList) {
        articleContainer.getChildren().clear();

        for (DayArticles day : dayArticlesList) {
            Label dateLabel = new Label(day.day.toString());
            dateLabel.setStyle("-fx-text-fill: #ffffff; -fx-font-size: 18; -fx-font-weight: bold;");
            articleContainer.getChildren().add(dateLabel);

            for (Article article : day.articles) {
                HBox articleRow = new HBox(10);
                Label timeLabel = new Label(article.time);
                Label titleLabel = new Label(article.title);

                timeLabel.setStyle("-fx-text-fill: #59747b;");
                titleLabel.setStyle("-fx-text-fill: #dddddd;");
                articleRow.getChildren().addAll(timeLabel, titleLabel);

                articleContainer.getChildren().add(articleRow);
            }
        }
    }
    private void updateDayArticles() {
        spinner.setVisible(true);

        Task<Void> scrapingTask = new Task<>(){
            @Override
            protected Void call() throws Exception {
                Scraper.getNewsParis();
                return null;
            }
        };
        scrapingTask.setOnSucceeded(event -> {
            List<DayArticles> dayArticlesList = DayArticlesUtils.getAllDayArticles();
            dayArticlesList = dayArticlesList.stream().sorted(
                    (a, b) -> b.day.compareTo(a.day)
            ).toList();
            displayDayArticles(dayArticlesList);
            spinner.setVisible(false);
        } );
        scrapingTask.setOnFailed(event -> {
            spinner.setVisible(false);
            Throwable e = scrapingTask.getException();
            e.printStackTrace();
        });

        Thread scrapingThread = new Thread(scrapingTask);
        scrapingThread.setDaemon(true);
        scrapingThread.start();
    }
}
