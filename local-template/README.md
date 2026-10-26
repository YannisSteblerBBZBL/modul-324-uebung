# Lokaler Ordner für sensible Daten

Bitte **kopiere** diesen Ordner und **nenne ihn nach `local` um**.

Der Ordner `local` ist in der Datei [.gitignore](../.gitignore) eingetragen,
wird daher von Git ignoriert und bleibt lokal.

> [!CAUTION]
> Es handelt sich um Zugangsdaten, diese dürfen <u>**NIE**</u> in `git` eingecheckt werden!

Sie sind nötig, damit vom lokalen devcontainer aus nach AWS zugegriffen werden kann.

## Aufgaben

- In die Datei [./aws/credentials](./aws/credentials) müssen die credentials vom AWS Lerner Lab kopiert werden.
- In die Datei [./ssh/id_rsa.pem](./ssh/id_rsa.pem) muss der private key vom AWS Lerner Lab kopiert werden.
- In die Datei [./.env](.env) müssen die entsprechenden Werte eingetragen werden

> [!NOTE]
> Benötigt von `docker compose`!
> In der Datei [../docker-compose.yml](../docker-compose.yml) werden
>
> - die Ordner `local/aws` und `local/ssh` als `Volumen` dem devcontainer zur Verfügung gestellt.
> - die Datei `local/.env` geladen. Ohne das kopieren geht `docker-compose up` nicht!

> [!IMPORTANT]
>
> - Die credentials werden **zusätzlich** in GitHub als Environment Variablen (Typ Secret) erfasst
> - Bei jedem neuen Login in das "AWS Learner Lab" müssen die Credentials neu kopiert werden
