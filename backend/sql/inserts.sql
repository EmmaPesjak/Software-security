INSERT INTO "user" ("username", "hashedPassword", "name", "email")
VALUES
("annaandersson", "b045b95e74c6e5db72a8ae1c81c773dd51017490d38f1a989c87af10283a5a80", "Anna Andersson", "annaandersson@gmail.com"),
("larsjohansson", "66dcb860d8807847683869f59eb34f9367c48a6ba9490b7a12d38d8d364a8d82", "Lars Johansson", "larsjohansson@gmail.com"),
("mariakarlsson", "c2bd8e185bdee8ba3906293e11efa7b5519ce951116b3f11a3741ff1c61dd083", "Maria Karlsson", "mariakarlsson@gmail.com"),
("andersnilsson", "642e3c6ad1529f654172cfc1790f45dbb1201d9083cfac60cebeb0a1a009cb61", "Anders Nilsson", "andersnilsson@gmail.com"),
("evaeriksson", "ae154c4d2be8d4e94b8d1acd20f71288bbd537e599fd8e6027a0cf2750b01b22", "Eva Eriksson", "evaeriksson@gmail.com"),
("johanlarsson", "b793bb45981b4c2babbfed9f54662f6e9bd052db9c72c05e77d0f00c020a7fbb", "Johan Larsson", "johanlarsson@gmail.com"),
("karinolsson", "56716ec44e9c6989e660e6e07989a68422f511fd7b322115add64de3fb8155fb", "Karin Olsson", "karinolsson@gmail.com"),
("peterpersson", "e86529d2f2386c55c57b67a1a05b08abd1e489806ec2ce7d744144e3488c52dc", "Peter Persson", "peterpersson@gmail.com"),
("sarasvensson", "bc60d8bc0368ee956abb170df9b1f68c1cd5cca8300f12f102245915dfdf4832", "Sara Svensson", "sarasvensson@gmail.com"),
("danielgustafsson", "2e8edcbf091ab6a39ae55a0c9c7a00f793c39683898937d8760e04017c98d2d8", "Daniel Gustafsson", "danielgustafsson@gmail.com");

-- The passwords are their first name + "pass", e.g.: annapass

INSERT INTO "post" ("content", "user")
VALUES
("Bla bla bla.", 1),
("Bla bla bla.", 2),
("Bla bla bla.", 3),
("Bla bla bla.", 4),
("Bla bla bla.", 5),
("Bla bla bla.", 6),
("Bla bla bla.", 7),
("Bla bla bla.", 8),
("Bla bla bla.", 9),
("Bla bla bla.", 10);

INSERT INTO "like" ("post", "user")
VALUES
(2, 1),
(1, 2);

INSERT INTO "dislike" ("post", "user")
VALUES
(3, 1),
(3, 2);
