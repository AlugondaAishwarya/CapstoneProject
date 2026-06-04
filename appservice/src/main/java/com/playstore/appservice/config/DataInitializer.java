package com.playstore.appservice.config;

import com.playstore.appservice.entity.App;
import com.playstore.appservice.repository.AppRepository;
import com.playstore.appservice.repository.DownloadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final int MAX_APPS_PER_CATEGORY = 3;
    private final Map<String, Integer> seededCategoryCounts = new HashMap<>();

    @Autowired
    private AppRepository appRepository;

    @Autowired
    private DownloadRepository downloadRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("[DATA INITIALIZER] Reseeding clean real-world apps with original details...");
        downloadRepository.deleteAll();
        appRepository.deleteAll();
        seededCategoryCounts.clear();

        // 1. All Apps (Top Essentials)
        createApp("Google Chrome", "Travel & Utilities", "dev@chrome.com", 
                  "Google Chrome is a fast, easy to use, and secure web browser designed for the modern web.", 
                  "122.0.0", "2008-09-02", 4.1, 10000000000L, "135 MB");
        createApp("Truecaller", "Social Media & Communication", "dev@truecaller.com", 
                  "Identify unknown calls, block spam calls and SMS, and communicate safely with millions of users.", 
                  "14.1.0", "2009-07-01", 4.4, 1000000000L, "82 MB");
        createApp("JioTV", "Entertainment & Streaming", "dev@jio.com", 
                  "Watch Live TV channels across news, sports, entertainment, movies, and music in multiple languages.", 
                  "7.0.8", "2016-09-05", 4.2, 100000000L, "45 MB");
        createApp("Instagram", "Social Media & Communication", "dev@instagram.com", 
                  "Bringing you closer to the people and things you love. Share photos, videos, and stories with friends.", 
                  "310.0.5", "2010-10-06", 4.3, 5000000000L, "210 MB");
        createApp("WhatsApp", "Social Media & Communication", "dev@whatsapp.com", 
                  "Simple, secure, and reliable messaging and calling, available on phones all over the world.", 
                  "2.26.5", "2009-02-25", 4.3, 5000000000L, "162 MB");

        // 2. Games
        createApp("Battlegrounds Mobile India (BGMI)", "Games", "dev@krafton.com", 
                  "BGMI is a premier battle royale game where players battle in a shrinking arena to be the last team standing.", 
                  "2.8.0", "2021-07-02", 4.3, 100000000L, "1.9 GB");
        createApp("Free Fire Max", "Games", "dev@garena.com", 
                  "Free Fire MAX is designed exclusively to deliver a premium gameplay experience in a Battle Royale format.", 
                  "2.100.1", "2021-09-28", 4.2, 100000000L, "1.1 GB");
        createApp("Subway Surfers", "Games", "dev@kiloo.com", 
                  "Help Jake, Tricky & Fresh escape from the grumpy Inspector and his dog in this endless running adventure.", 
                  "3.20.0", "2012-05-24", 4.6, 1000000000L, "145 MB");
        createApp("Candy Crush Saga", "Games", "dev@king.com", 
                  "Start playing Candy Crush Saga today - a legendary puzzle game loved by millions of players around the world.", 
                  "1.260.0", "2012-11-12", 4.6, 1000000000L, "115 MB");
        createApp("Ludo King", "Games", "dev@gametion.com", 
                  "Ludo King is a classic board game played between friends and family. Recall your childhood!", 
                  "8.0.0", "2016-02-20", 4.2, 500000000L, "72 MB");
        createApp("Clash of Clans", "Games", "dev@supercell.com", 
                  "Join millions of players worldwide as you build your village, raise a clan, and compete in epic Clan Wars!", 
                  "15.80.0", "2012-08-02", 4.5, 500000000L, "310 MB");

        // 3. Beauty
        createApp("Nykaa", "Beauty", "dev@nykaa.com", 
                  "Nykaa is a premier online beauty app that lets you choose from over 100,000 beauty products and 850+ brands.", 
                  "10.5.2", "2012-11-01", 4.4, 50000000L, "58 MB");
        createApp("Purplle", "Beauty", "dev@purplle.com", 
                  "Shop makeup, skincare, haircare, and personal care products at the best prices on India's top beauty app.", 
                  "8.4.1", "2012-12-01", 4.3, 10000000L, "62 MB");
        createApp("Tira", "Beauty", "dev@tira.com", 
                  "Tira is your go-to beauty destination, offering a curated assortment of global and local beauty brands.", 
                  "2.1.0", "2023-04-10", 4.4, 5000000L, "48 MB");
        createApp("Sugar Cosmetics", "Beauty", "dev@sugar.com", 
                  "Shop long-lasting makeup, beauty products, lipsticks, foundations, and skin care formulations.", 
                  "4.0.2", "2015-07-01", 4.2, 5000000L, "35 MB");
        createApp("Plum Goodness", "Beauty", "dev@plum.com", 
                  "Shop 100% vegan, cruelty-free beauty, skincare, makeup, and body care products built with goodness.", 
                  "1.8.0", "2014-07-01", 4.2, 1000000L, "28 MB");

        // 4. Fashion
        createApp("Myntra", "Fashion", "dev@myntra.com", 
                  "Myntra is your one-stop shop for fashion and lifestyle. Buy clothing, footwear, accessories, and home decor.", 
                  "4.26.1", "2007-05-10", 4.3, 100000000L, "75 MB");
        createApp("Ajio", "Fashion", "dev@reliance.com", 
                  "AJIO is a fashion and lifestyle brand that brings the trendiest styles at unbeatable prices.", 
                  "8.2.0", "2016-04-01", 4.2, 50000000L, "68 MB");
        createApp("Urbanic", "Fashion", "dev@urbanic.com", 
                  "Urbanic is an emerging fashion brand offering young women the latest trends, accessories, and style updates.", 
                  "5.3.1", "2019-06-01", 4.0, 10000000L, "54 MB");
        createApp("Tata CLiQ", "Fashion", "dev@tata.com", 
                  "Shop luxury and premium fashion, electronics, and footwear online from authentic international brands.", 
                  "6.0.4", "2016-05-27", 4.1, 10000000L, "49 MB");
        createApp("H&M", "Fashion", "dev@hm.com", 
                  "Browse, shop, and stay updated with the latest fashion trends anywhere, anytime with the H&M app.", 
                  "12.1.0", "2015-09-01", 4.2, 50000000L, "85 MB");

        // 5. Women (Safety, Community & Tracking)
        createApp("Flo Period Tracker", "Women (Safety, Community & Tracking)", "dev@flo.com", 
                  "Track your cycle, ovulation, and symptoms. Flo is a smart and simple period tracker and pregnancy app.", 
                  "9.12.0", "2015-10-01", 4.8, 100000000L, "65 MB");
        createApp("Clue Period Tracker", "Women (Safety, Community & Tracking)", "dev@clue.com", 
                  "Track your period cycle, flow, moods, and body symptoms to understand your personal health patterns.", 
                  "7.5.0", "2013-07-01", 4.5, 10000000L, "42 MB");
        createApp("Sheroes (Community)", "Women (Safety, Community & Tracking)", "dev@sheroes.com", 
                  "A safe, women-only community app offering support, career opportunities, health tips, and friendship.", 
                  "5.2.1", "2014-01-10", 4.2, 1000000L, "24 MB");
        createApp("112 India (Emergency/Safety)", "Women (Safety, Community & Tracking)", "dev@emergency.gov", 
                  "112 India is an all-in-one emergency response system to dispatch police, fire, and medical help instantly.", 
                  "2.0.1", "2018-02-19", 4.0, 5000000L, "12 MB");
        createApp("Peanut (Moms Community)", "Women (Safety, Community & Tracking)", "dev@peanut.com", 
                  "Peanut connects women across all stages of motherhood to chat, ask questions, share support, and find friends.", 
                  "4.8.0", "2017-02-09", 4.3, 1000000L, "52 MB");

        // 6. Health & Fitness
        createApp("Cult.fit", "Health & Fitness", "dev@curefit.com", 
                  "Cult.fit is a health and fitness platform that offers workouts, yoga, healthy food, and mental wellness sessions.", 
                  "7.1.0", "2016-05-01", 4.5, 10000000L, "90 MB");
        createApp("HealthifyMe", "Health & Fitness", "dev@healthifyme.com", 
                  "Calorie counter, food diary, weight tracker, and AI nutritionist to help you live healthy and active.", 
                  "12.4.0", "2012-01-01", 4.4, 10000000L, "78 MB");
        createApp("MyFitnessPal", "Health & Fitness", "dev@myfitnesspal.com", 
                  "Track progress toward your nutrition, water, fitness, and weight loss goals with the MyFitnessPal food diary.", 
                  "24.5.0", "2009-12-01", 4.3, 100000000L, "115 MB");
        createApp("Strava", "Health & Fitness", "dev@strava.com", 
                  "Record your runs, rides, and hikes, analyze your training metrics, and share adventures with the community.", 
                  "320.0.0", "2009-08-18", 4.5, 50000000L, "125 MB");
        createApp("Fitbit", "Health & Fitness", "dev@fitbit.com", 
                  "Get a picture of your health by tracking steps, distance, active minutes, calories burned, sleep, and heart rate.", 
                  "4.10.2", "2011-09-01", 4.0, 100000000L, "95 MB");

        // 7. Social Media & Communication
        createApp("Telegram", "Social Media & Communication", "dev@telegram.com", 
                  "Pure instant messaging — simple, fast, secure, and synced across all your devices.", 
                  "10.2.1", "2013-08-14", 4.3, 1000000000L, "102 MB");
        createApp("Facebook", "Social Media & Communication", "dev@facebook.com", 
                  "Find friends, watch live videos, play games & save photos in your social network.", 
                  "440.0.0", "2004-02-04", 4.1, 5000000000L, "185 MB");
        createApp("Snapchat", "Social Media & Communication", "dev@snapchat.com", 
                  "Snapchat is a fast and fun way to share the moment with your friends and family.", 
                  "12.60.2", "2011-09-16", 4.1, 1000000000L, "142 MB");
        createApp("Pinterest", "Social Media & Communication", "dev@pinterest.com", 
                  "Find recipes, style inspiration, home hacks, DIY tutorials, and creative ideas.", 
                  "11.45.0", "2010-01-01", 4.5, 500000000L, "74 MB");
        createApp("LinkedIn", "Social Media & Communication", "dev@linkedin.com", 
                  "Build your network, find jobs, read business news, and establish your professional brand.", 
                  "4.1.920", "2003-05-05", 4.3, 1000000000L, "92 MB");

        // 8. Entertainment & Streaming
        createApp("YouTube", "Entertainment & Streaming", "dev@google.com", 
                  "See what the world is watching — from the hottest music videos to what's popular in gaming, fitness, and news.", 
                  "19.05.3", "2005-02-14", 4.1, 10000000000L, "195 MB");
        createApp("Netflix", "Entertainment & Streaming", "dev@netflix.com", 
                  "Watch award-winning series, movies, documentaries, and stand-up specials. Get tailored recommendations.", 
                  "8.95.0", "2005-02-26", 4.2, 1000000000L, "88 MB");
        createApp("Amazon Prime Video", "Entertainment & Streaming", "dev@amazon.com", 
                  "Watch movies, TV shows, and sports, including Amazon Originals like The Boys and Jack Ryan.", 
                  "3.0.360", "2006-09-07", 4.1, 500000000L, "94 MB");
        createApp("Disney+ Hotstar", "Entertainment & Streaming", "dev@hotstar.com", 
                  "Disney+ Hotstar is the go-to video streaming app for the best of live sports, TV shows, and movies.", 
                  "24.2.1", "2015-02-11", 4.1, 500000000L, "110 MB");
        createApp("Spotify", "Entertainment & Streaming", "dev@spotify.com", 
                  "Listen to songs, play playlists, stream music, and enjoy podcasts on your phone and tablet.", 
                  "8.9.10", "2006-04-23", 4.4, 1000000000L, "115 MB");
        createApp("Wynk Music", "Entertainment & Streaming", "dev@airtel.com", 
                  "Wynk Music is the one-stop music app for the latest to the greatest songs that you love.", 
                  "3.36.0", "2014-09-01", 4.0, 100000000L, "38 MB");
        createApp("JioSaavn", "Entertainment & Streaming", "dev@jio.com", 
                  "JioSaavn is the best way to listen to all your music, radio, and podcasts for free.", 
                  "9.2.2", "2007-01-01", 4.1, 100000000L, "46 MB");
        createApp("Twitch", "Entertainment & Streaming", "dev@twitch.com", 
                  "Watch live gameplay, esports tournaments, creative streams, and chat with creators and communities.", 
                  "15.8.0", "2011-06-06", 4.5, 100000000L, "92 MB");

        // 9. Shopping & E-Commerce
        createApp("Amazon", "Shopping & E-Commerce", "dev@amazon.com", 
                  "Shop millions of products, compare prices, read reviews, and track your orders easily.", 
                  "26.4.2", "1995-07-16", 4.2, 500000000L, "118 MB");
        createApp("Flipkart", "Shopping & E-Commerce", "dev@flipkart.com", 
                  "Explore catalog of fashion, electronics, appliances, furniture, and groceries on India's giant e-commerce platform.", 
                  "17.8.0", "2007-10-01", 4.2, 500000000L, "95 MB");
        createApp("Meesho", "Shopping & E-Commerce", "dev@meesho.com", 
                  "Shop the latest fashion, home and kitchen items at direct-from-manufacturer prices.", 
                  "14.2.1", "2015-12-01", 4.3, 100000000L, "58 MB");
        createApp("Blinkit", "Shopping & E-Commerce", "dev@zomato.com", 
                  "Get groceries, vegetables, cosmetics, toys and household items delivered to your doorstep in 10 minutes.", 
                  "12.1.0", "2013-12-01", 4.4, 10000000L, "35 MB");
        createApp("Zepto", "Shopping & E-Commerce", "dev@zepto.com", 
                  "Zepto is a fast-growing 10-minute grocery delivery service delivering fresh farm products and groceries.", 
                  "4.5.1", "2021-04-01", 4.4, 10000000L, "32 MB");
        createApp("Instamart", "Shopping & E-Commerce", "dev@swiggy.com", 
                  "Order groceries, household items, fresh snacks and drinks instantly via Swiggy Instamart.", 
                  "6.20.1", "2020-08-01", 4.3, 100000000L, "65 MB");

        // 10. Productivity & Education
        createApp("Google Drive", "Productivity & Education", "dev@google.com", 
                  "Google Drive, part of Google Workspace, is a safe place to back up and access all your files from any device.", 
                  "2.24.1", "2012-04-24", 4.3, 5000000000L, "88 MB");
        createApp("Microsoft Office", "Productivity & Education", "dev@microsoft.com", 
                  "Word, Excel, PowerPoint, and PDF editing on the go with the unified Microsoft 365 app.", 
                  "16.0.1", "2015-06-24", 4.4, 1000000000L, "145 MB");
        createApp("Notion", "Productivity & Education", "dev@notion.com", 
                  "Notion is a single collaborative workspace for your notes, tasks, wikis, database, and project tracking.", 
                  "0.24.0", "2016-03-01", 4.2, 10000000L, "52 MB");
        createApp("Duolingo", "Productivity & Education", "dev@duolingo.com", 
                  "Learn Spanish, French, German, Italian, English, and more with fun, bite-sized game lessons.", 
                  "5.142.1", "2012-06-19", 4.7, 100000000L, "110 MB");
        createApp("Khan Academy", "Productivity & Education", "dev@khanacademy.com", 
                  "Learn math, science, economics, finance, grammar, history, and test preparation for free.", 
                  "7.8.2", "2012-03-10", 4.4, 10000000L, "36 MB");

        // 11. Travel & Utilities
        createApp("Google Maps", "Travel & Utilities", "dev@google.com", 
                  "Navigate your world faster and easier with Google Maps. Real-time GPS navigation, traffic, and transit info.", 
                  "11.118.0", "2005-02-08", 4.1, 10000000000L, "125 MB");
        createApp("Uber", "Travel & Utilities", "dev@uber.com", 
                  "Request a ride on Uber. Choose from Uber Go, Premier, Auto, Moto, and get reliable transport in minutes.", 
                  "4.510.0", "2011-06-01", 4.4, 500000000L, "96 MB");
        createApp("PhonePe", "Travel & Utilities", "dev@phonepe.com", 
                  "PhonePe is a payments app that allows you to use BHIM UPI, credit card, or debit card to pay bills and recharge.", 
                  "4.1.20", "2015-12-01", 4.4, 500000000L, "82 MB");
        createApp("Google Pay", "Travel & Utilities", "dev@google.com", 
                  "Google Pay is a safe, simple, and helpful way to make digital payments and track expenses directly from bank account.", 
                  "2.220.0", "2015-09-11", 4.3, 500000000L, "78 MB");

        System.out.println("[DATA INITIALIZER] Populated database with " + appRepository.count() + " apps!");
    }

    private void createApp(String name, String category, String developer, String description, 
                           String version, String releaseDate, Double rating, Long downloads, String storageSize) {
        int categoryCount = seededCategoryCounts.getOrDefault(category, 0);
        if (categoryCount >= MAX_APPS_PER_CATEGORY) {
            return;
        }

        App app = new App();
        app.setAppName(name);
        app.setCategory(category);
        app.setDeveloperName("developer@gmail.com");
        app.setDescription(description);
        app.setVersion(version);
        app.setReleaseDate(releaseDate);
        app.setRating(0.0);
        app.setDownloads(0L);
        app.setVisible(true);
        app.setStorageSize(storageSize);
        appRepository.save(app);
        seededCategoryCounts.put(category, categoryCount + 1);
    }
}
