package org.example.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Group;
import javafx.scene.Parent;
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
    @FXML private BorderPane contentPane;

    @FXML
    private void initialize() {
        journalButton.setOnAction(e -> loadView("/ui/journal.fxml"));
        pluginsButton.setOnAction(e -> loadView("/ui/plugins.fxml"));

        //pluginsButton.setOnAction(e -> showSection("plugins"));
        themesButton.setOnAction(e -> showSection("themes"));
    }

    private void showSection(String section) {
        //journalPane.setVisible("journal".equals(section));
        pluginsPane.setVisible("plugins".equals(section));
        themesPane.setVisible("themes".equals(section));
    }
    private void loadView(String fxmlPath) {
        try {
            //pluginsPane.setVisible(false);
            themesPane.setVisible(false);
            FXMLLoader loader = new FXMLLoader(getClass().getResource(fxmlPath));
            Pane view = loader.load();
            /*contentPane.getChildren().setAll(view);*/
            Parent parent = contentPane.getParent();
            System.out.println("debug 1");
            if (parent instanceof Pane paneParent) {
                System.out.println("debug 2");
                int index = paneParent.getChildren().indexOf(contentPane);
                if (index != -1) {
                    System.out.println("debug 3");
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
