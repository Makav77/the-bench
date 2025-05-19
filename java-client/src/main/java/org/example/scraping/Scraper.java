package org.example.scraping;

import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlAnchor;
import com.gargoylesoftware.htmlunit.html.HtmlImage;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import org.example.dao.DayArticlesDAO;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.example.scraping.Model.Cinema.*;

public class Scraper {
    public static void getNewsParis() {
        // à réactiver pour debug
        Logger.getLogger("com.gargoylesoftware").setLevel(Level.OFF);
        Logger.getLogger("org.apache.http").setLevel(Level.OFF);
        try (WebClient webClient = new WebClient()) {
            webClient.getOptions().setJavaScriptEnabled(true);
            webClient.getOptions().setCssEnabled(false);
            webClient.getOptions().setThrowExceptionOnScriptError(false);
            webClient.addRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            HtmlPage page = webClient.getPage("https://www.sortiraparis.com/");
            webClient.waitForBackgroundJavaScript(5000);

            HtmlElement body = page.getBody();
            HtmlElement news = body.getFirstByXPath("//div[@class='live']");
            List<HtmlElement> newsList = news.getByXPath(".//div[@class='row ' or @class='row hidden']");
            /*int counter = 0;
            for (HtmlElement element : newsList) {
                System.out.println(counter+ " : " +element.asNormalizedText());
                counter++;
            }*/

            List<DayArticles> dayArticles = new ArrayList<>();
            DayArticles currentArticles = null;

            for (HtmlElement element : newsList) {
                String elementText = element.asNormalizedText().trim();  // On enlève les espaces (en début et fin de chaine) pour être sûr de bien parser les données
                if (elementText.matches("^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)$")) {
                    // Si un jour précédent existe on l'ajoute dans la liste avant de réinitialiser
                    if (currentArticles != null) {
                        dayArticles.add(currentArticles);
                    }
                    currentArticles = new DayArticles(
                            DayArticlesUtils.resolveDayNameToDate(elementText, LocalDate.now()),
                            new ArrayList<>()
                    );
                } else {
                    // regex sous la forme "(chiffre) chiffre h chiffre chiffre puis espace puis texte"
                    Pattern pattern = Pattern.compile("^(\\d{1,2}h\\d{2})\\s+(.+)$");
                    Matcher matcher = pattern.matcher(elementText);
                    if (matcher.find()) {
                        String time = matcher.group(1);
                        String title = matcher.group(2);
                        Article article = new Article(time, title);
                        if (currentArticles != null) {
                            currentArticles.articles.add(article);
                        }
                    } else {
                        System.out.println("Pas de match : " + elementText);
                    }
                }
            }
            if (currentArticles != null) {
                dayArticles.add(currentArticles);
            }

            System.out.println(dayArticles.size());
            DayArticlesUtils.printDayArticles(dayArticles);
            DayArticlesUtils.InsertDayArticles(dayArticles);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public static List<FilmPresentation> getSeancesChatelet(){
        System.out.println("Seances Chatelet");
        Logger.getLogger("com.gargoylesoftware").setLevel(Level.OFF);
        Logger.getLogger("org.apache.http").setLevel(Level.OFF);
        try (WebClient webClient = new WebClient()) {
            System.out.println("Seances Chatelet 1");

            webClient.getOptions().setJavaScriptEnabled(true);
            webClient.getOptions().setCssEnabled(false);
            webClient.getOptions().setThrowExceptionOnScriptError(false);
            webClient.addRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            System.out.println("Seances Chatelet 2");

            HtmlPage page = webClient.getPage("https://www.ugc.fr/cinema.html?id=10");
            System.out.println("Seances Chatelet 3");

            webClient.waitForBackgroundJavaScript(5000);
            System.out.println("Seances Chatelet 4");

            HtmlElement body = page.getBody();
            //List<HtmlElement> seance = body.getByXPath("//div[@class='slider-item']");

            List<HtmlElement> filmBlocks = body.getByXPath("//div[contains(@class,'component--film-presentation')]");
            List<FilmPresentation> films = new ArrayList<>();
            for(HtmlElement filmBlock : filmBlocks) {
                FilmPresentation film = new FilmPresentation();

                HtmlAnchor titleAnchor = filmBlock.getFirstByXPath(".//div[contains(@class,'block--title')]//a");
                film.titre = titleAnchor.asNormalizedText();
                film.lien = titleAnchor.getHrefAttribute();

                HtmlImage img = filmBlock.getFirstByXPath(".//div[contains(@class,'img-wrapper')]//img");
                film.imageUrl = img.getSrcAttribute();

                HtmlElement genreDurée = filmBlock.getFirstByXPath(".//p[contains(@class,'color--dark-blue')]");
                String[] parts = genreDurée.asNormalizedText().split("\\(");
                film.genres = parts[0].trim();
                film.duree = parts.length > 1 ? parts[1].replace(")", "").trim() : "";

                HtmlElement dateSortie = filmBlock.getFirstByXPath(".//p[contains(.,'Sortie le')]//span");
                film.dateSortie = (dateSortie != null)? dateSortie.asNormalizedText() : "";

                HtmlElement realisateur = filmBlock.getFirstByXPath(".//p[contains(.,'De')]//span");
                film.realisateur =  (realisateur != null) ? realisateur.asNormalizedText() : "";

                HtmlElement acteurs = filmBlock.getFirstByXPath(".//p[contains(.,'Avec')]//span");
                film.acteurs = (acteurs != null) ? acteurs.asNormalizedText(): "";

                HtmlElement synopsis = filmBlock.getFirstByXPath(".//p[contains(.,'Synopsis')]//span");
                film.synopsis = (synopsis != null) ? synopsis.asNormalizedText() : "";

                List<HtmlElement> seancesHtml = body.getByXPath("//ul[contains(@class,'component--screening-cards')]//li");
                for (HtmlElement seanceHtml : seancesHtml) {
                    Seance seance = new Seance();
                    seance.version = ((HtmlElement) seanceHtml.getFirstByXPath(".//span[contains(@class,'screening-lang')]")).asNormalizedText();
                    seance.heureDebut = ((HtmlElement) seanceHtml.getFirstByXPath(".//div[contains(@class,'screening-start')]")).asNormalizedText();
                    seance.heureFin = ((HtmlElement) seanceHtml.getFirstByXPath(".//div[contains(@class,'screening-end')]")).asNormalizedText();
                    seance.salle = ((HtmlElement) seanceHtml.getFirstByXPath(".//div[contains(@class,'screening-detail')]")).asNormalizedText();
                    HtmlElement button = seanceHtml.getFirstByXPath(".//button");
                    seance.lienReservation = button.getAttribute("onclick").replace("javascript:location.href='", "").replace("'", "");
                    film.seances.add(seance);
                }
                System.out.println("filme : " + film.acteurs);
                System.out.println("filme : " +  film.seances.size());
                films.add(film);
            }
            return films;
        }
        catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
