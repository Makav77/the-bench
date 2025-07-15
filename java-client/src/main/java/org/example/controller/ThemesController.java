package org.example.controller;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.layout.BorderPane;
import org.example.theme.ThemeManager;



public class ThemesController {
    @FXML private BorderPane themesPane;

    @FXML
    private void initialize() {
        ThemeManager.applyThemeToRoot(themesPane);
        System.out.println("Vue Themes chargée !");
    }

    @FXML
    public void onNatureThemeSelected(ActionEvent actionEvent) {
        ThemeManager.setTheme(ThemeManager.NATURE, themesPane.getScene());
    }

    @FXML
    public void onDarkThemeSelected(ActionEvent actionEvent) {
        ThemeManager.setTheme(ThemeManager.DARK, themesPane.getScene());
    }

    @FXML
    public void onPastelThemeSelected(ActionEvent actionEvent) {
        ThemeManager.setTheme(ThemeManager.PASTEL, themesPane.getScene());
    }
}