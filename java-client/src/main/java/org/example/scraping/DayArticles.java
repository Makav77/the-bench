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
}
