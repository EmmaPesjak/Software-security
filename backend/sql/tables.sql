CREATE TABLE "user" (
	"userId"	INTEGER NOT NULL UNIQUE,
	"username"	TEXT NOT NULL UNIQUE,
	"hashedPassword"	TEXT NOT NULL,
	"name"	TEXT NOT NULL,
	"email"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("userId" AUTOINCREMENT)
);

CREATE TABLE "post" (
	"postId"	INTEGER NOT NULL UNIQUE,
	"content"	TEXT NOT NULL,
	"user"	INTEGER NOT NULL,
	PRIMARY KEY("postId" AUTOINCREMENT),
	FOREIGN KEY("user") REFERENCES "user"("userId")
);

CREATE TABLE "like" (
	"post"	INTEGER NOT NULL,
	"user"	INTEGER NOT NULL,
	FOREIGN KEY("post") REFERENCES "post"("postId"),
	FOREIGN KEY("user") REFERENCES "user"("userId")
);

CREATE TABLE "dislike" (
	"post"	INTEGER NOT NULL,
	"user"	INTEGER NOT NULL,
	FOREIGN KEY("post") REFERENCES "post"("postId"),
	FOREIGN KEY("user") REFERENCES "user"("userId")
);
