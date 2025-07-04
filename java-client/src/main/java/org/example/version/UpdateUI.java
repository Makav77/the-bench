package org.example.version;

import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.stage.Modality;
import javafx.stage.Stage;
import org.example.application.AppUtils;

import java.awt.*;
import java.util.Optional;

public class UpdateUI {

    public static void showUpdatePrompt(String remoteVersion, Runnable onAccept) {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
        alert.setTitle("Mise à jour disponible");

        alert.setHeaderText("Nouvelle version : " + remoteVersion);
        alert.setContentText("Voulez-vous la télécharger maintenant ?");

        Stage stage = (Stage) alert.getDialogPane().getScene().getWindow();
        stage.getIcons().add(
                new javafx.scene.image.Image(UpdateUI.class.getResourceAsStream("/ui/icons/app_logo_transparent.png"))
        );
        stage.initModality(Modality.APPLICATION_MODAL);

        Optional<ButtonType> result = alert.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {
            onAccept.run();
        }
    }
}
