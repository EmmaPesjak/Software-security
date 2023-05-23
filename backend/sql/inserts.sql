INSERT INTO "user" ("username", "hashedPassword", "name", "email")
VALUES
("annaandersson", "bb4adbb74a402e7d57541852375a2724d831c08b2b21cb91b5e7301d0558ec1a", "Anna Andersson", "annaandersson@gmail.com"),
("larsjohansson", "bb59457da50a55cc7f7da8da6584d0123e2fa65c0dd929c60333076cefef6228", "Lars Johansson", "larsjohansson@gmail.com"),
("mariakarlsson", "aa7257c9b2e3a590166219a1218f9259bc45cde69d603fd136cb878ebe9d795f", "Maria Karlsson", "mariakarlsson@gmail.com"),
("andersnilsson", "5705457d884363e651cf38d312abadafa6dc573ec61c28238431ad64dc631245", "Anders Nilsson", "andersnilsson@gmail.com"),
("evaeriksson", "1372972677755e798ac7d8622a866e7b2bb67e8d798feda42efac7e160591e50", "Eva Eriksson", "evaeriksson@gmail.com"),
("johanlarsson", "7589fb8ce05fbce2f778d95c422315df4dc54f84e3bb83d3889ece7f73c4f34e", "Johan Larsson", "johanlarsson@gmail.com"),
("karinolsson", "8df83c301d2c5427340f70acf41eff47e01cd4e7d2163e5dfb84189a5b1d9083", "Karin Olsson", "karinolsson@gmail.com"),
("peterpersson", "7cdef1ed0cebbdbb6afe86fc37ac622830dfde503377b2ea0b5ca031be344882", "Peter Persson", "peterpersson@gmail.com"),
("sarasvensson", "5683407bc02d43311deaa588a185ca7d6423ecd6ea09f97b1dca705673d3e5bd", "Sara Svensson", "sarasvensson@gmail.com"),
("danielgustafsson", "02656f325a9db04b84d806e51f038ead9fd0a89e0a22e71cb295a6bb3721b502", "Daniel Gustafsson", "danielgustafsson@gmail.com");

-- The passwords are their initials in uppercase + "Guestbook123%", e.g.: AAGuestbook123%

INSERT INTO "post" ("content", "user")
VALUES
("Thank you for your warm hospitality! Our stay was truly memorable, and we couldn't have asked for a better experience. Your attention to detail and friendly staff made us feel right at home. We'll definitely be recommending your establishment to our friends and family!", 1),
("What a delightful retreat! The serene surroundings and comfortable accommodations provided the perfect escape from the hustle and bustle of everyday life. We appreciated the personal touches and the genuine care you showed us during our stay. We'll cherish the memories made here.", 2),
("Wow! This place exceeded our expectations in every way. From the breathtaking views to the impeccable service, everything was simply outstanding. We couldn't have chosen a better destination for our vacation. Thank you for making it truly special.", 3),
("Thank you for making our anniversary celebration so magical! The romantic ambiance, exquisite dining experience, and thoughtful surprises made it an unforgettable evening. Your staff went above and beyond to ensure we had a truly memorable stay. We can't wait to return!", 4),
("Such a charming bed and breakfast! The cozy rooms, delectable breakfast spread, and friendly atmosphere made our stay here a joy. It's evident that you pour your heart into every detail, and it truly shows. We look forward to visiting again in the future!", 5),
("To the entire team, thank you for making our family vacation unforgettable! The kids had a blast exploring the grounds and enjoying the activities you provided. The genuine warmth and friendliness of the staff made us feel like part of the family. We're already planning our next visit!", 6),
("What a hidden gem! Stumbling upon your quaint inn was a stroke of luck. The peaceful surroundings, cozy rooms, and delicious homemade treats made it a memorable weekend getaway. Thank you for creating such a welcoming and charming atmosphere.", 7),
("I can't express enough gratitude for the incredible service we received during our stay. From the moment we arrived, we were greeted with smiles and genuine kindness. The attention to detail and willingness to go the extra mile truly sets you apart. Thank you for an exceptional experience!", 8),
("Words can't do justice to the beauty of this place. The stunning vistas, tranquil gardens, and luxurious accommodations exceeded our wildest dreams. It was a true escape from reality, and we left feeling refreshed and rejuvenated. Thank you for creating a slice of paradise.", 9),
("This guesthouse holds a special place in our hearts. We've stayed here multiple times, and each visit has been exceptional. The warm welcome, cozy rooms, and delicious breakfast make it feel like a home away from home. We can't wait to return to our little haven.", 10);

INSERT INTO "like" ("post", "user")
VALUES
(2, 1),
(1, 2);

INSERT INTO "dislike" ("post", "user")
VALUES
(3, 1),
(3, 2);
