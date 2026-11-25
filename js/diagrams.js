/* Opisy diagramów UML. Wymiary w (w, h) muszą zgadzać się z --w/--h w index.html. */
window.DIAGRAMS = {
  anatomia: {
    id: "anatomia", w: 640, h: 270, interactive: false,
    title: "Budowa prostokąta klasy: Person ze składnikami statycznymi oraz abstrakcyjna Figura z klasą pochodną Kolo",
    nodes: [
      { id: "p", title: "Person", x: 20, y: 20,
        attrs: ["- firstName: String", "- lastName: String", "# dob: DateTime", "_- count: int = 0"],
        ops: ["+ getFirstName(): String", "+ setFirstName(n: String): void", "# getDob(): DateTime", "_+ getCount(): int"] },
      { id: "f", title: "Figura", abstract: true, x: 380, y: 20,
        attrs: ["# nazwa: String"], ops: ["*+ pole(): double", "+ opis(): String"] },
      { id: "k", title: "Kolo", x: 395, y: 170, attrs: ["- r: double"], ops: ["+ pole(): double"] }
    ],
    edges: [{ from: "k", to: "f", type: "inheritance", fp: "t", tp: "b", tf: 0.5, ff: 0.5 }]
  },

  "rel-dziedziczenie": {
    id: "rel-dziedziczenie", w: 380, h: 90, interactive: false,
    title: "Dziedziczenie: Student dziedziczy po Osoba",
    nodes: [{ id: "a", title: "Student", x: 12, y: 27 }, { id: "b", title: "Osoba", x: 288, y: 27 }],
    edges: [{ from: "a", to: "b", type: "inheritance" }]
  },
  "rel-implementacja": {
    id: "rel-implementacja", w: 380, h: 90, interactive: false,
    title: "Implementacja: Kolekcja implementuje interfejs ISortable",
    nodes: [{ id: "a", title: "Kolekcja", x: 12, y: 27 }, { id: "b", title: "ISortable", stereo: "interface", x: 268, y: 19 }],
    edges: [{ from: "a", to: "b", type: "realization" }]
  },
  "rel-kompozycja": {
    id: "rel-kompozycja", w: 380, h: 90, interactive: false,
    title: "Kompozycja: Dom składa się z pokoi, wypełniony romb przy Dom",
    nodes: [{ id: "a", title: "Dom", x: 12, y: 27 }, { id: "b", title: "Pokoj", x: 288, y: 27 }],
    edges: [{ from: "a", to: "b", type: "composition", fm: "1", tm: "1..*" }]
  },
  "rel-agregacja": {
    id: "rel-agregacja", w: 380, h: 90, interactive: false,
    title: "Agregacja: Firma zatrudnia osoby, pusty romb przy Firma",
    nodes: [{ id: "a", title: "Firma", x: 12, y: 27 }, { id: "b", title: "Osoba", x: 288, y: 27 }],
    edges: [{ from: "a", to: "b", type: "aggregation", tm: "0..*" }]
  },
  "rel-asocjacja": {
    id: "rel-asocjacja", w: 380, h: 90, interactive: false,
    title: "Asocjacja: Osoba akceptuje Umowa, krotności 1 i 0..n",
    nodes: [{ id: "a", title: "Osoba", x: 12, y: 27 }, { id: "b", title: "Umowa", x: 288, y: 27 }],
    edges: [{ from: "a", to: "b", type: "association", arrow: false, label: "akceptuje", fm: "1", tm: "0..n" }]
  },
  "rel-zaleznosc": {
    id: "rel-zaleznosc", w: 380, h: 90, interactive: false,
    title: "Zależność: Osoba tworzy Konto, przerywana linia ze stereotypem create",
    nodes: [{ id: "a", title: "Osoba", x: 12, y: 27 }, { id: "b", title: "Konto", x: 288, y: 27 }],
    edges: [{ from: "a", to: "b", type: "dependency", label: "\u00abcreate\u00bb" }]
  },

  "isp-zle": {
    id: "isp-zle", w: 720, h: 300,
    title: "Łamanie zasady segregacji interfejsów: jeden gruby interfejs UrzadzenieBiurowe",
    nodes: [
      { id: "i", title: "UrzadzenieBiurowe", stereo: "interface", x: 283, y: 20,
        ops: ["+ drukuj(): void", "+ skanuj(): void", "+ faksuj(): void"],
        note: "Gruby interfejs (fat interface): trzy niezwiązane możliwości w jednym kontrakcie. Każdy, kto go implementuje, musi dostarczyć wszystkie trzy metody." },
      { id: "d", title: "ZwyklaDrukarka", x: 60, y: 190,
        ops: ["+ drukuj(): void", "+ skanuj(): void  // pusta", "+ faksuj(): void  // wyjątek"],
        note: "Drukarka umie tylko drukować, ale interfejs zmusza ją do skanuj() i faksuj(). Kończy się pustymi metodami albo rzucaniem wyjątku: to jest właśnie łamanie ISP." },
      { id: "m", title: "UrzadzenieWielofunkcyjne", x: 440, y: 190,
        ops: ["+ drukuj(): void", "+ skanuj(): void", "+ faksuj(): void"],
        note: "Kombajn biurowy faktycznie ma wszystkie trzy funkcje, więc dla niego gruby interfejs nie boli. Problem dotyczy tylko klas, które czegoś nie umieją." }
    ],
    edges: [
      { from: "d", to: "i", type: "realization", fp: "t", tp: "b", tf: 0.3,
        note: "Linia przerywana z pustym trójkątem: ZwyklaDrukarka implementuje UrzadzenieBiurowe. Zmiana w faksuj() wymusza ponowną kompilację i testy także drukarki." },
      { from: "m", to: "i", type: "realization", fp: "t", tp: "b", tf: 0.7,
        note: "Implementacja interfejsu przez urządzenie wielofunkcyjne." }
    ]
  },

  "isp-dobrze": {
    id: "isp-dobrze", w: 760, h: 300,
    title: "Zgodnie z zasadą segregacji interfejsów: trzy małe interfejsy Drukarka, Skaner, Faks",
    nodes: [
      { id: "d", title: "Drukarka", stereo: "interface", x: 40, y: 20, w: 140, ops: ["+ drukuj(): void"],
        note: "Mały interfejs z jedną możliwością. Klasa dobiera tylko te interfejsy, które naprawdę obsługuje." },
      { id: "s", title: "Skaner", stereo: "interface", x: 310, y: 20, w: 140, ops: ["+ skanuj(): void"],
        note: "Osobny kontrakt na skanowanie." },
      { id: "f", title: "Faks", stereo: "interface", x: 580, y: 20, w: 140, ops: ["+ faksuj(): void"],
        note: "Osobny kontrakt na faksowanie. Zmiana tutaj nie dotyka zwykłej drukarki." },
      { id: "z", title: "ZwyklaDrukarka", x: 40, y: 200, w: 140, ops: ["+ drukuj(): void"],
        note: "Implementuje tylko Drukarka. Żadnych pustych metod ani sztucznych wyjątków." },
      { id: "m", title: "UrzadzenieWielofunkcyjne", x: 480, y: 190, ops: ["+ drukuj(): void", "+ skanuj(): void", "+ faksuj(): void"],
        note: "Implementuje wszystkie trzy małe interfejsy, bo ma wszystkie trzy funkcje." }
    ],
    edges: [
      { from: "z", to: "d", type: "realization", fp: "t", tp: "b",
        note: "ZwyklaDrukarka implementuje tylko interfejs Drukarka." },
      { from: "m", to: "d", type: "realization", fp: "t", ff: 0.2, tp: "b", tf: 0.8, my: 160,
        note: "Urządzenie wielofunkcyjne implementuje Drukarka." },
      { from: "m", to: "s", type: "realization", fp: "t", ff: 0.5, tp: "b", my: 140,
        note: "Urządzenie wielofunkcyjne implementuje Skaner." },
      { from: "m", to: "f", type: "realization", fp: "t", ff: 0.8, tp: "b", my: 140,
        note: "Urządzenie wielofunkcyjne implementuje Faks." }
    ]
  },

  singleton: {
    id: "singleton", w: 580, h: 170,
    title: "Wzorzec Singleton: statyczne pole instance, prywatny konstruktor, statyczna metoda getInstance",
    nodes: [
      { id: "k", title: "Klient", x: 40, y: 60,
        note: "Dowolny kod, który potrzebuje obiektu. Nie może zrobić new Singleton(), bo konstruktor jest prywatny, więc woła Singleton.getInstance()." },
      { id: "s", title: "Singleton", x: 300, y: 30,
        attrs: ["_- instance: Singleton"], ops: ["- Singleton()", "_+ getInstance(): Singleton"],
        note: "Klasa pilnuje, żeby istniał co najwyżej jeden jej obiekt. Podkreślone składniki są statyczne (należą do klasy). Minus przy konstruktorze oznacza, że jest prywatny." }
    ],
    edges: [
      { from: "k", to: "s", type: "dependency", label: "getInstance()",
        note: "Zależność (przerywana linia z otwartą strzałką): klient korzysta z klasy przez statyczną metodę getInstance(). Metoda zwraca istniejący obiekt albo tworzy go przy pierwszym wywołaniu." },
      { from: "s", to: "s", type: "association", points: [[507, 50], [545, 50], [545, 100], [507, 100]], label: "instance", lx: 512, ly: 42, la: "start",
        name: "Singleton \u2192 Singleton: asocjacja do samego siebie",
        note: "Statyczne pole instance trzyma referencję do jedynego obiektu tej samej klasy. Na diagramie można to pokazać jako asocjację klasy z samą sobą (opcjonalne)." }
    ]
  },

  adapter: {
    id: "adapter", w: 760, h: 350,
    title: "Wzorzec Adapter z Laboratorium 2: Polar2DAdapter dopasowuje Vector2D do interfejsu IPolar2D",
    nodes: [
      { id: "c", title: "Client", x: 30, y: 42,
        note: "Klient chce pracować na współrzędnych biegunowych, więc oczekuje interfejsu IPolar2D. Nie wie nic o Vector2D." },
      { id: "p", title: "IPolar2D", stereo: "interface", x: 195, y: 20, ops: ["+ getAngle(): double"],
        note: "Interfejs docelowy (Target): to, czego oczekuje klient." },
      { id: "v", title: "IVector", stereo: "interface", x: 500, y: 20,
        ops: ["+ abs(): double", "+ cdot(p: IVector): double", "+ getComponents(): double[]"],
        note: "Wspólny interfejs wektorów. Adapter też go implementuje, więc można go użyć wszędzie tam, gdzie zwykłego wektora." },
      { id: "a", title: "Polar2DAdapter", x: 170, y: 200,
        attrs: ["- srcVector: Vector2D"],
        ops: ["+ getAngle(): double", "+ abs(): double", "+ cdot(p: IVector): double", "+ getComponents(): double[]"],
        note: "Adapter. Trzyma referencję srcVector do adaptowanego obiektu i deleguje do niego abs(), cdot(), getComponents(). Jedyna nowa logika to getAngle(), liczona przez atan2(y, x)." },
      { id: "x", title: "Vector2D", x: 500, y: 200,
        attrs: ["- x: double", "- y: double"],
        ops: ["+ abs(): double", "+ cdot(p: IVector): double", "+ getComponents(): double[]"],
        note: "Klasa adaptowana (Adaptee): istniejący wektor w układzie kartezjańskim. Jej kodu nie zmieniamy." }
    ],
    edges: [
      { from: "c", to: "p", type: "association", label: "używa",
        note: "Asocjacja (ciągła linia z otwartą strzałką): klient woła metody interfejsu IPolar2D." },
      { from: "a", to: "p", type: "realization", fp: "t", tp: "b",
        note: "Implementacja (przerywana linia, pusty trójkąt przy interfejsie): adapter spełnia kontrakt, którego oczekuje klient." },
      { from: "a", to: "v", type: "realization", fp: "t", ff: 0.8, tp: "l", tf: 0.85,
        note: "Adapter implementuje też IVector, więc jest wymienny z Vector2D." },
      { from: "a", to: "x", type: "association", fp: "r", ff: 0.55, tp: "l", tf: 0.55, label: "srcVector", tm: "1",
        note: "Adapter trzyma referencję do obiektu Vector2D i przekazuje mu wywołania. To jest sedno adaptera: tłumaczenie wywołań na obiekt z innym interfejsem." },
      { from: "x", to: "v", type: "realization", fp: "t", tp: "b",
        note: "Vector2D implementuje IVector." }
    ]
  },

  dekorator: {
    id: "dekorator", w: 760, h: 400,
    title: "Wzorzec Dekorator z Laboratorium 2: Vector3DDecorator owija dowolny IVector i dodaje trzeci wymiar",
    nodes: [
      { id: "v", title: "IVector", stereo: "interface", x: 273, y: 20,
        ops: ["+ abs(): double", "+ cdot(p: IVector): double", "+ getComponents(): double[]"],
        note: "Komponent: wspólny interfejs obiektu dekorowanego i dekoratora. Dzięki niemu dekorator wygląda z zewnątrz tak samo jak zwykły wektor." },
      { id: "x", title: "Vector2D", x: 40, y: 220,
        attrs: ["- x: double", "- y: double"],
        ops: ["+ abs(): double", "+ cdot(p: IVector): double", "+ getComponents(): double[]"],
        note: "Konkretny komponent: obiekt, który owijamy." },
      { id: "d", title: "Vector3DDecorator", x: 430, y: 220,
        attrs: ["- srcVector: IVector", "- z: double"],
        ops: ["+ abs(): double", "+ cdot(p: IVector): double", "+ getComponents(): double[]", "+ cross(p: IVector): Vector3DDecorator", "+ getSrcV(): IVector"],
        note: "Dekorator: implementuje IVector i jednocześnie trzyma referencję do innego IVector. Dodaje składową z oraz nową operację cross() (iloczyn wektorowy). getSrcV() zwraca owinięty obiekt." }
    ],
    edges: [
      { from: "x", to: "v", type: "realization", fp: "t", tp: "b", tf: 0.3,
        note: "Vector2D implementuje IVector." },
      { from: "d", to: "v", type: "realization", fp: "t", ff: 0.3, tp: "b", tf: 0.7,
        note: "Dekorator implementuje ten sam interfejs co obiekt, który owija. Dlatego można owijać wielokrotnie." },
      { from: "d", to: "v", type: "aggregation", fp: "t", ff: 0.75, tp: "r", tf: 0.5, label: "srcVector", tm: "1",
        name: "Vector3DDecorator \u25c7 IVector: agregacja (srcVector)",
        note: "Agregacja (pusty romb przy dekoratorze): dekorator przechowuje owinięty obiekt, ale go nie tworzy i nie odpowiada za jego życie. To połączenie \u201eimplementuje i zawiera ten sam interfejs\u201d rozpoznaje dekorator na diagramie." }
    ]
  },

  stan: {
    id: "stan", w: 800, h: 330,
    title: "Wzorzec Stan: Zamowienie deleguje akcje do obiektu StanZamowienia",
    nodes: [
      { id: "z", title: "Zamowienie", role: "Kontekst", x: 20, y: 30,
        attrs: ["- stan: StanZamowienia"],
        ops: ["+ zmienStan(s: StanZamowienia): void", "+ oplac(): void", "+ anuluj(): void"],
        note: "Kontekst. Przechowuje aktualny obiekt stanu i deleguje do niego wywołania: oplac() robi stan.oplac(this). Nie ma tu żadnego if/switch po stanach." },
      { id: "i", title: "StanZamowienia", stereo: "interface", x: 420, y: 46,
        ops: ["+ oplac(z: Zamowienie): void", "+ anuluj(z: Zamowienie): void"],
        note: "Wspólny interfejs wszystkich stanów. Każda akcja dostaje kontekst w parametrze, żeby stan mógł go przełączyć." },
      { id: "n", title: "StanNowe", x: 290, y: 230,
        ops: ["+ oplac(z: Zamowienie): void", "+ anuluj(z: Zamowienie): void"],
        note: "Konkretny stan. anuluj() zwraca pieniądze, oplac() przełącza zamówienie na StanWyslane." },
      { id: "w", title: "StanWyslane", x: 560, y: 230,
        ops: ["+ oplac(z: Zamowienie): void", "+ anuluj(z: Zamowienie): void"],
        note: "Inny konkretny stan. Ta sama metoda anuluj() działa tu inaczej: blokuje operację, bo paczka już wyjechała." }
    ],
    edges: [
      { from: "z", to: "i", type: "aggregation", fp: "r", tp: "l", label: "stan", tm: "1",
        note: "Agregacja (pusty romb przy kontekście): zamówienie przechowuje referencję do bieżącego stanu i przekazuje mu wywołania." },
      { from: "n", to: "i", type: "realization", fp: "t", tp: "b",
        note: "StanNowe implementuje interfejs StanZamowienia." },
      { from: "w", to: "i", type: "realization", fp: "t", tp: "b",
        note: "StanWyslane implementuje interfejs StanZamowienia." },
      { from: "n", to: "z", type: "dependency", fp: "l", tp: "b", tf: 0.6, label: "z.zmienStan(...)", lx: 176, ly: 214, la: "end",
        note: "Zależność: konkretny stan sam przełącza kontekst w kolejny stan, wołając z.zmienStan(new StanWyslane())." }
    ]
  },

  pamiatka: {
    id: "pamiatka", w: 720, h: 340,
    title: "Wzorzec Pamiątka: EdytorTekstu tworzy Pamiatka, Historia przechowuje listę pamiątek",
    nodes: [
      { id: "e", title: "EdytorTekstu", role: "Twórca", x: 20, y: 30,
        attrs: ["- tekst: String"],
        ops: ["+ wpisz(t: String): void", "+ zapisz(): Pamiatka", "+ przywroc(p: Pamiatka): void"],
        note: "Twórca (Originator): obiekt, którego stan zapisujemy. Sam tworzy pamiątkę ze swoich prywatnych danych i sam się z niej odtwarza, więc pola nie muszą być publiczne." },
      { id: "p", title: "Pamiatka", role: "Memento", x: 450, y: 38,
        attrs: ["- zapisanyTekst: String"],
        ops: ["+ Pamiatka(t: String)", "+ pobierzTekst(): String"],
        note: "Pamiątka (Memento): mały, zwykle niemodyfikowalny obiekt z migawką stanu." },
      { id: "h", title: "Historia", role: "Opiekun", x: 443, y: 210,
        attrs: ["- stos: List<Pamiatka>"],
        ops: ["+ dodaj(p: Pamiatka): void", "+ cofnij(): Pamiatka"],
        note: "Opiekun (Caretaker): przechowuje pamiątki (np. na stosie dla Ctrl+Z), ale nie zagląda do ich zawartości." }
    ],
    edges: [
      { from: "e", to: "p", type: "dependency", fp: "r", tp: "l", label: "\u00abcreate\u00bb tworzy / czyta",
        note: "Zależność (przerywana linia z otwartą strzałką): Twórca tworzy Pamiatka przy zapisz() i czyta ją przy przywroc()." },
      { from: "h", to: "p", type: "aggregation", fp: "t", tp: "b", label: "stos", tm: "0..*",
        note: "Agregacja (pusty romb przy Opiekunie): Historia trzyma wiele pamiątek, ale ich nie modyfikuje. Oddaje je Twórcy przy cofaniu." }
    ]
  },

  strategia: {
    id: "strategia", w: 760, h: 330,
    title: "Wzorzec Strategia z Laboratorium 4: Context deleguje execute do wymiennego obiektu IStrategy",
    nodes: [
      { id: "c", title: "Context", x: 20, y: 40,
        attrs: ["- strategy: IStrategy"], ops: ["+ setStrategy(s: IStrategy): void", "+ execute(): void"],
        note: "Kontekst trzyma referencję do jednej strategii i przy execute() deleguje do niej całą pracę. Strategię można podmienić w trakcie działania programu przez setStrategy()." },
      { id: "i", title: "IStrategy", stereo: "interface", x: 440, y: 48, ops: ["+ execute(): void"],
        note: "Wspólny interfejs rodziny algorytmów. Dzięki niemu strategie są wymienne." },
      { id: "a", title: "ConcreteStrategyA", x: 350, y: 220, ops: ["+ execute(): void"],
        note: "Jeden konkretny algorytm, np. wybór najbliższej jednostki straży." },
      { id: "b", title: "ConcreteStrategyB", x: 540, y: 220, ops: ["+ execute(): void"],
        note: "Inny algorytm z tym samym interfejsem. Dodanie kolejnego nie wymaga zmiany Context (zasada otwarte/zamknięte)." },
      { id: "k", title: "Client", x: 109, y: 240,
        note: "Klient tworzy obiekt strategii i wiąże go z kontekstem. To klient decyduje, której strategii użyć." }
    ],
    edges: [
      { from: "c", to: "i", type: "aggregation", fp: "r", tp: "l", label: "strategy", tm: "1",
        note: "Agregacja: kontekst przechowuje strategię, ale jej nie tworzy." },
      { from: "a", to: "i", type: "realization", fp: "t", tp: "b",
        note: "ConcreteStrategyA implementuje IStrategy." },
      { from: "b", to: "i", type: "realization", fp: "t", tp: "b",
        note: "ConcreteStrategyB implementuje IStrategy." },
      { from: "k", to: "c", type: "association", fp: "t", tp: "b", label: "setStrategy()",
        note: "Klient konfiguruje kontekst, przekazując mu strategię." },
      { from: "k", to: "a", type: "dependency", fp: "r", tp: "l", tf: 0.594, label: "\u00abcreate\u00bb",
        note: "Klient tworzy obiekt konkretnej strategii." }
    ]
  },

  iterator: {
    id: "iterator", w: 760, h: 330,
    title: "Wzorzec Iterator z Laboratorium 4: ConcreteAggregate tworzy ConcreteIterator",
    nodes: [
      { id: "ag", title: "Aggregate", stereo: "interface", x: 40, y: 30, ops: ["+ iterator(): Iterator"],
        note: "Interfejs kolekcji: umie tylko wyprodukować iterator." },
      { id: "it", title: "Iterator", stereo: "interface", x: 486.5, y: 22, ops: ["+ hasNext(): bool", "+ next(): Object"],
        note: "Interfejs przechodzenia: hasNext() sprawdza, czy są jeszcze elementy, next() zwraca kolejny." },
      { id: "ca", title: "ConcreteAggregate", x: 40, y: 220, attrs: ["- items: Object[]"], ops: ["+ iterator(): Iterator"],
        note: "Konkretna kolekcja. Ukrywa swoją strukturę (tablica, lista, drzewo); na zewnątrz udostępnia tylko iterator." },
      { id: "ci", title: "ConcreteIterator", x: 440, y: 200, attrs: ["- aggregate: ConcreteAggregate", "- index: int"], ops: ["+ hasNext(): bool", "+ next(): Object"],
        note: "Konkretny iterator. Pamięta pozycję (index) i zna kolekcję, po której chodzi." }
    ],
    edges: [
      { from: "ca", to: "ag", type: "realization", fp: "t", tp: "b",
        note: "ConcreteAggregate implementuje Aggregate." },
      { from: "ci", to: "it", type: "realization", fp: "t", tp: "b",
        note: "ConcreteIterator implementuje Iterator." },
      { from: "ca", to: "ci", type: "dependency", fp: "r", ff: 0.35, tp: "l", tf: 0.4286, label: "\u00abcreate\u00bb",
        note: "Zależność ze stereotypem \u00abcreate\u00bb: kolekcja tworzy iterator w metodzie iterator()." },
      { from: "ci", to: "ca", type: "association", fp: "l", ff: 0.75, tp: "r", tf: 0.8, label: "aggregate", lx: 341, ly: 300,
        note: "Asocjacja: iterator trzyma referencję do kolekcji, po której przechodzi." }
    ]
  },

  obserwator: {
    id: "obserwator", w: 780, h: 330,
    title: "Wzorzec Obserwator z Laboratorium 4: ObservedSubject powiadamia listę obiektów Observer",
    nodes: [
      { id: "s", title: "ObservedSubject", x: 20, y: 30,
        attrs: ["- observers: List<Observer>", "# state: byte[]"],
        ops: ["+ addObserver(o: Observer): void", "+ removeObserver(o: Observer): void", "+ notifyObserver(o: Observer): void", "+ notifyAll(): void"],
        note: "Podmiot obserwowany: trzyma listę subskrybentów i powiadamia ich o zmianie stanu. Uwaga w Javie: notifyAll() to finalna metoda klasy Object, więc w kodzie trzeba ją nazwać inaczej, np. notifyAllObservers()." },
      { id: "o", title: "Observer", stereo: "interface", x: 480, y: 62, ops: ["+ update(data: byte[]): void"],
        note: "Interfejs obserwatora: jedna metoda update(), którą podmiot woła przy zmianie." },
      { id: "c", title: "ConcreteObserver", x: 480, y: 230, ops: ["+ update(data: byte[]): void"],
        note: "Konkretny obserwator, np. jednostka JRG, która reaguje na zgłoszenie od SKKM." }
    ],
    edges: [
      { from: "s", to: "o", type: "aggregation", fp: "r", tp: "l", label: "observers", tm: "0..*",
        note: "Agregacja z krotnością 0..*: jeden podmiot, wielu obserwatorów (komunikacja jeden do wielu). Obserwatorzy istnieją niezależnie od podmiotu." },
      { from: "c", to: "o", type: "realization", fp: "t", tp: "b",
        note: "ConcreteObserver implementuje Observer." }
    ]
  }
};
