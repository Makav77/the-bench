package org.example.controller;

import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import org.example.scraping.Article;
import org.example.scraping.DayArticles;
import org.example.scraping.DayArticlesUtils;
import org.example.scraping.Scraper;
import org.example.scraping.Model.Cinema.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class JournalController {

    @FXML
    private VBox articleContainer;
    @FXML private Button updateButton;
    @FXML private ProgressIndicator spinner;
    @FXML private MenuItem ResentButton;
    @FXML private MenuItem OldButton;
    @FXML private TextField searchField;
    @FXML private Button searchButton;
    @FXML private Button cinemaButton;

    @FXML
    private void initialize() {
        System.out.println("Vue JournalController chargée !");
        List<DayArticles> dayArticlesList = DayArticlesUtils.getAllDayArticles();
        dayArticlesList = dayArticlesList.stream().sorted(
                (a, b) -> b.day.compareTo(a.day)
        ).toList();
        displayDayArticles(dayArticlesList);
        updateButton.setOnAction(e -> updateDayArticles());
        ResentButton.setOnAction(e -> displayDayArticles(sortRecentDayArticles()));
        OldButton.setOnAction(e -> displayDayArticles(sortOldDayArticles()));
        searchButton.setOnAction(e -> displayDayArticles(filterByTitle(searchField.getText())));
        cinemaButton.setOnAction(e->{
            spinner.setVisible(true);
            Scraper.getSeancesChatelet();
            articleContainer.getChildren().clear();

            new Thread(() -> {
                try {
                    List<FilmPresentation> films = Scraper.getSeancesChatelet();
                    javafx.application.Platform.runLater(() -> {
                        int i = 0;
                        for (FilmPresentation film : films) {
                            i++;
                            if (i >= 5) break;
                            VBox filmBox = new VBox(5);
                            filmBox.setStyle("-fx-background-color: #2E3440; -fx-padding: 10; -fx-border-color: #59747b; -fx-border-width: 1;");
                            filmBox.getChildren().add(styledLabel("🎬 " + film.titre));
                            filmBox.getChildren().add(styledLabel("Genres : " + film.genres));
                            filmBox.getChildren().add(styledLabel("Sortie : " + film.dateSortie));
                            filmBox.getChildren().add(styledLabel("Durée : " + film.duree));
                            filmBox.getChildren().add(styledLabel("Réalisateur : " + film.realisateur));
                            filmBox.getChildren().add(styledLabel("Acteurs : " + film.acteurs));
                            filmBox.getChildren().add(styledLabel("Synopsis : " + film.synopsis));

                            for (Seance seance : film.seances) {
                                HBox seanceBox = new HBox(10);
                                seanceBox.getChildren().add(styledLabel("🕒 " + seance.heureDebut + " - " + seance.heureFin));
                                seanceBox.getChildren().add(styledLabel("📍 Salle : " + seance.salle));
                                seanceBox.getChildren().add(styledLabel("🎞️ Version : " + seance.version));
                                filmBox.getChildren().add(seanceBox);
                            }

                            articleContainer.getChildren().add(filmBox);
                        }
                        spinner.setVisible(false);
                        System.out.println("END");
                    });
                } catch (Exception ex) {
                    ex.printStackTrace();
                    javafx.application.Platform.runLater(() -> spinner.setVisible(false));
                }
            }).start();
        });
    }

    private Label styledLabel(String text) {
        Label label = new Label(text);
        label.setStyle("-fx-font-size: 17px; -fx-text-fill: white;");
        return label;
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

    public static List<DayArticles> filterByTitle(String filter) {
        List<DayArticles> allDays = DayArticlesUtils.getAllDayArticles();
        String lowerFilter = filter.toLowerCase();

        return allDays.stream()
                .map(dayArticle -> {
                    List<Article> filteredArticles = dayArticle.articles.stream()
                            .filter(article -> article.title.toLowerCase().contains(lowerFilter))
                            .collect(Collectors.toList());
                    filteredArticles.addAll(dayArticle.articles.stream()
                            .filter(article -> article.time.toLowerCase().contains(lowerFilter)
                            && !filteredArticles.contains(article))
                    .toList());

                    if (!filteredArticles.isEmpty()) {
                        DayArticles filteredDay = new DayArticles(dayArticle.day, filteredArticles);
                        filteredDay.id = dayArticle.id;
                        return filteredDay;
                    } else {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<DayArticles> sortOldDayArticles() {
        List<DayArticles> dayArticlesList = DayArticlesUtils.getAllDayArticles();
        dayArticlesList = dayArticlesList.stream().sorted(
                (a, b) -> a.day.compareTo(b.day)
        ).toList();
        return dayArticlesList;
    }

    public List<DayArticles> sortRecentDayArticles() {
        List<DayArticles> dayArticlesList = DayArticlesUtils.getAllDayArticles();
        dayArticlesList = dayArticlesList.stream().sorted(
                (a, b) -> b.day.compareTo(a.day)
        ).toList();
        return dayArticlesList;
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
