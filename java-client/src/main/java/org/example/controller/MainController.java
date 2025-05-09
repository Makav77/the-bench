package org.example.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Group;
import javafx.scene.Parent;
import javafx.scene.control.Button;
import javafx.scene.layout.*;
import org.example.theme.ThemeManager;

public class MainController {
    @FXML private StackPane contentStack;
    @FXML private BorderPane journalPane;
    @FXML private BorderPane pluginsPane;
    @FXML private BorderPane themesPane;
    @FXML private Button journalButton;
    @FXML private Button pluginsButton;
    @FXML private Button themesButton;
    @FXML private BorderPane contentPane;
    @FXML private BorderPane mainPane;

    @FXML
    private void initialize() {
        ThemeManager.applyThemeToRoot(mainPane);
        journalButton.sceneProperty().addListener((obs, oldScene, newScene) -> {
            if (newScene != null) {
                ThemeManager.applyTheme(newScene);
            }
        });
        loadView("/ui/journal.fxml");
        journalButton.setOnAction(e -> loadView("/ui/journal.fxml"));
        pluginsButton.setOnAction(e -> loadView("/ui/plugins.fxml"));
        themesButton.setOnAction(e -> loadView("/ui/themes.fxml"));
    }

    private void showSection(String section) {
        journalPane.setVisible("journal".equals(section));
        pluginsPane.setVisible("plugins".equals(section));
        themesPane.setVisible("themes".equals(section));
    }
    private void loadView(String fxmlPath) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource(fxmlPath));
            Pane view = loader.load();
            view.sceneProperty().addListener((obs, oldScene, newScene) -> {
                if (newScene != null) {
                    ThemeManager.applyTheme(newScene);
                }
            });
            /*contentPane.getChildren().setAll(view);*/
            Parent parent = contentPane.getParent();
            if (parent instanceof Pane paneParent) {
                int index = paneParent.getChildren().indexOf(contentPane);
                if (index != -1) {
                    paneParent.getChildren().set(index, view);
                }
            }
            contentPane = (BorderPane) view;
            contentPane.setVisible(true);
            System.out.println("Vue chargée : " + fxmlPath);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
