package org.example.scraping;

import java.util.List;
import java.time.*;
import java.util.*;

public class DayArticles {
    public LocalDate day;
    public List<Article> articles;

    public DayArticles(LocalDate day, List<Article> articles) {
        this.day = day;
        this.articles = articles;
    }
    public static LocalDate resolveDayNameToDate(String dayNameFr, LocalDate today) {
        Map<String, DayOfWeek> frenchToEnum = Map.of(
                "LUNDI", DayOfWeek.MONDAY,
                "MARDI", DayOfWeek.TUESDAY,
                "MERCREDI", DayOfWeek.WEDNESDAY,
                "JEUDI", DayOfWeek.THURSDAY,
                "VENDREDI", DayOfWeek.FRIDAY,
                "SAMEDI", DayOfWeek.SATURDAY,
                "DIMANCHE", DayOfWeek.SUNDAY
        );

        DayOfWeek targetDay = frenchToEnum.get(dayNameFr.toUpperCase());
        if (targetDay == null) {
            throw new IllegalArgumentException("Jour inconnu : " + dayNameFr);
        }

        DayOfWeek todayDay = today.getDayOfWeek();
        int diff = targetDay.getValue() - todayDay.getValue();

        if (diff > 0) {
            return today.minusDays(7 - diff); // jour dans la semaine dernière
        } else {
            return today.plusDays(diff); // jour cette semaine ou aujourd'hui (plus day car diff est négatif ou 0)
        }
    }
}
