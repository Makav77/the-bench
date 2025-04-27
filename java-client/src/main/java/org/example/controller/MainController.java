package org.example.controller;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.layout.*;

public class MainController {
    @FXML private StackPane contentStack;
    @FXML private BorderPane journalPane;
    @FXML private BorderPane pluginsPane;
    @FXML private BorderPane themesPane;
    @FXML private Button journalButton;
    @FXML private Button pluginsButton;
    @FXML private Button themesButton;

    @FXML
    private void initialize() {
        journalButton.setOnAction(e -> showSection("journal"));
        pluginsButton.setOnAction(e -> showSection("plugins"));
        themesButton.setOnAction(e -> showSection("themes"));
    }

    private void showSection(String section) {
        journalPane.setVisible("journal".equals(section));
        pluginsPane.setVisible("plugins".equals(section));
        themesPane.setVisible("themes".equals(section));
    }
}
