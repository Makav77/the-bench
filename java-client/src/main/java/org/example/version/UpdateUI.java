package org.example.version;

import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;

import java.util.Optional;

public class UpdateUI {

    public static void showUpdatePrompt(String remoteVersion, Runnable onAccept) {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
        alert.setTitle("Mise à jour disponible");
        alert.setHeaderText("Nouvelle version : " + remoteVersion);
        alert.setContentText("Voulez-vous la télécharger maintenant ?");

        Optional<ButtonType> result = alert.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {
            onAccept.run();
        }
    }
}
