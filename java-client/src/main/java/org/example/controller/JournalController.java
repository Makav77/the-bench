package org.example.controller;

import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.MenuItem;
import javafx.scene.control.TextField;
import javafx.scene.layout.*;
import org.example.scraping.Article;
import org.example.scraping.DayArticles;
import org.example.scraping.DayArticlesUtils;
import org.example.scraping.Scraper;
import org.example.theme.ThemeManager;
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
    @FXML private BorderPane journalPane;
    @FXML private MenuItem ResentButton;
    @FXML private MenuItem OldButton;
    @FXML private TextField searchField;
    @FXML private Button searchButton;
    @FXML private Button cinemaButton;
    @FXML private Button newsButton;
    @FXML private SplitMenuButton itemsButton;

    private Node originalNode;
    private Spinner<Integer> pagesSpinner;
    private HBox spinnerWithLabel;

    public enum DataDisplayed{
        ARTICLES,
        MOVIES,
    }
    public DataDisplayed dataDisplayed = DataDisplayed.ARTICLES;
    public List<FilmPresentation> films = new ArrayList<>();
    public static final int filmsPerPage = 5;

    @FXML
    private void initialize() {
        ThemeManager.applyThemeToRoot(journalPane);
        System.out.println("Vue JournalController chargée !");
        originalNode = itemsButton;
        dataDisplayed = DataDisplayed.ARTICLES;
        List<DayArticles> dayArticlesList = DayArticlesUtils.getAllDayArticles();
        dayArticlesList = dayArticlesList.stream().sorted(
                (a, b) -> b.day.compareTo(a.day)
        ).toList();
        displayDayArticles(dayArticlesList);
        updateButton.setOnAction(e -> {
            if (dataDisplayed == DataDisplayed.ARTICLES) {
                updateDayArticles();
            }
            else if (dataDisplayed == DataDisplayed.MOVIES) {
                spinner.setVisible(true);
                articleContainer.getChildren().clear();
                films.clear();
                getAndDisplayMovies();
            }
        });
        ResentButton.setOnAction(e -> displayDayArticles(sortRecentDayArticles()));
        newsButton.setOnAction(e -> displayDayArticles(sortRecentDayArticles()));
        newsButton.setOnAction(e->{
            dataDisplayed = DataDisplayed.ARTICLES;
            displayDayArticles(sortRecentDayArticles());
            restoreSplitMenuButton();
        });
        OldButton.setOnAction(e -> displayDayArticles(sortOldDayArticles()));
        searchButton.setOnAction(e->{
            String searchText = searchField.getText();
            if (dataDisplayed == DataDisplayed.ARTICLES) {
                displayDayArticles(filterByTitle(searchText));
            }
            else if (dataDisplayed == DataDisplayed.MOVIES) {
                List<FilmPresentation> filteredFilms = filtrerFilmsAvecSeances(films, searchText);
                articleContainer.getChildren().clear();
                displayMovies(filteredFilms, 1);
            }
        });
        cinemaButton.setOnAction(e->{
            if( dataDisplayed != DataDisplayed.MOVIES) {
                spinner.setVisible(true);
                articleContainer.getChildren().clear();
                replaceSplitMenuButtonWithSpinner(1, filmsPerPage, 1);
            }
            getAndDisplayMovies();
        });
    }

    public void getAndDisplayMovies(){
        new Thread(() -> {
            try {
                dataDisplayed = DataDisplayed.MOVIES;
                if (films.isEmpty()) {
                    films = Scraper.getSeancesChatelet();
                }
                System.out.println("count" + films.stream().count());
                javafx.application.Platform.runLater(() -> {
                    displayMovies(films, 1);
                    spinner.setVisible(false);
                    System.out.println("END");
                });
            } catch (Exception ex) {
                ex.printStackTrace();
                javafx.application.Platform.runLater(() -> spinner.setVisible(false));
            }
        }).start();
    }
    public void displayMovies(List<FilmPresentation> films, int pageNumber){
        int totalPages = (int) Math.ceil((double) films.size() / filmsPerPage);
        int fromIndex = (pageNumber - 1) * filmsPerPage;
        int toIndex = Math.min(fromIndex + filmsPerPage, films.size());
        List<FilmPresentation> sublist = films.subList(fromIndex, toIndex);
        int i = 0;
        for (FilmPresentation film : sublist) {
            VBox filmBox = new VBox(5);
            filmBox.setStyle("-fx-padding: 10; -fx-border-width: 1;");
            filmBox.getStyleClass().addAll("cinema-background", "border-dark");
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
            for (Node node : filmBox.getChildren()) {
                if (node instanceof Label label) {
                    label.getStyleClass().addAll("textfill-accent");
                } else if (node instanceof HBox hbox) {
                    for (Node inner : hbox.getChildren()) {
                        if (inner instanceof Label innerLabel) {
                            innerLabel.getStyleClass().addAll("textfill-accent");
                            //innerLabel.setStyle("-fx-text-fill: #D4A373;");
                        }
                    }
                }
            }
            articleContainer.getChildren().add(filmBox);
            filmBox.applyCss();
            filmBox.layout();
        }

        ThemeManager.applyThemeToRoot(journalPane);
    }
    public void replaceSplitMenuButtonWithSpinner(int min, int max, int initialValue) {
        if (originalNode == null) {
            originalNode = itemsButton;
        }

        VBox parent = (VBox) itemsButton.getParent();
        int index = parent.getChildren().indexOf(itemsButton);
        if (index != -1) {
            parent.getChildren().remove(index);
        }

        pagesSpinner = new Spinner<>();
        pagesSpinner.setValueFactory(new SpinnerValueFactory.IntegerSpinnerValueFactory(min, max, initialValue, 1));
        pagesSpinner.setPrefWidth(100);
        pagesSpinner.setEditable(false);

        Label label = new Label("Page :");
        label.getStyleClass().add("textfill-accent");

        spinnerWithLabel = new HBox(10);
        spinnerWithLabel.getChildren().addAll(label, pagesSpinner);

        VBox.setMargin(spinnerWithLabel, new Insets(0, 0, 5, 20));

        parent.getChildren().add(index, spinnerWithLabel);
        ThemeManager.applyThemeToRoot(journalPane);
        pagesSpinner.valueProperty().addListener((obs, oldVal, newVal) -> {
            articleContainer.getChildren().clear();
            displayMovies(films, newVal);
        });
    }


    public void restoreSplitMenuButton() {
        if (spinnerWithLabel == null || originalNode == null) return;

        VBox parent = (VBox) spinnerWithLabel.getParent();
        int index = parent.getChildren().indexOf(spinnerWithLabel);
        parent.getChildren().remove(spinnerWithLabel);
        parent.getChildren().add(index, originalNode);
    }

    private Label styledLabel(String text) {
        Label label = new Label(text);
        label.setStyle("-fx-font-size: 17px;");
        label.getStyleClass().add("textfill-accent");
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

    public List<FilmPresentation> filtrerFilmsAvecSeances(List<FilmPresentation> films, String recherche) {
        if (recherche == null || recherche.isBlank()) {
            return films;
        }

        String lowerRecherche = recherche.toLowerCase();

        return films.stream()
                .filter(film -> filmCorrespond(film, lowerRecherche))
                .toList();
    }

    private boolean filmCorrespond(FilmPresentation film, String recherche) {
        if ((film.titre != null && film.titre.toLowerCase().contains(recherche)) ||
                (film.genres != null && film.genres.toLowerCase().contains(recherche)) ||
                (film.dateSortie != null && film.dateSortie.toLowerCase().contains(recherche)) ||
                (film.duree != null && film.duree.toLowerCase().contains(recherche)) ||
                (film.realisateur != null && film.realisateur.toLowerCase().contains(recherche)) ||
                (film.acteurs != null && film.acteurs.toLowerCase().contains(recherche)) ||
                (film.synopsis != null && film.synopsis.toLowerCase().contains(recherche))) {
            return true;
        }

        for (Seance seance : film.seances) {
            if ((seance.salle != null && seance.salle.toLowerCase().contains(recherche)) ||
                    (seance.version != null && seance.version.toLowerCase().contains(recherche)) ||
                    (seance.heureDebut != null && seance.heureDebut.toLowerCase().contains(recherche)) ||
                    (seance.heureFin != null && seance.heureFin.toLowerCase().contains(recherche))) {
                return true;
            }
        }

        return false;
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
            dateLabel.setStyle("-fx-font-size: 18; -fx-font-weight: bold;");
            dateLabel.getStyleClass().addAll("textfill-medium");
            articleContainer.getChildren().add(dateLabel);

            for (Article article : day.articles) {
                HBox articleRow = new HBox(10);
                Label timeLabel = new Label(article.time);
                Label titleLabel = new Label(article.title);

                timeLabel.setStyle("-fx-text-fill: #59747b;");
                titleLabel.getStyleClass().addAll("textfill-accent");
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
