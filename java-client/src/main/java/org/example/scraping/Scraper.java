package org.example.scraping;

import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.html.HtmlElement;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
            //System.out.println(news.asNormalizedText());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
