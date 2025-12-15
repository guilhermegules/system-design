interface Observer {
  update(message: string): void;
}

interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

class NewsPublisher implements Subject {
  private observers: Observer[] = [];
  private latestNews: string = "";

  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  detach(observer: Observer): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  publishNews(news: string): void {
    this.latestNews = news;
    this.notify();
  }

  notify(): void {
    for (const observer of this.observers) {
      observer.update(this.latestNews);
    }
  }
}

class EmailSubscriber implements Observer {
  update(message: string): void {
    console.log(`📧 Email subscriber received: ${message}`);
  }
}

class SMSSubscriber implements Observer {
  update(message: string): void {
    console.log(`📱 SMS subscriber received: ${message}`);
  }
}

const publisher = new NewsPublisher();

const emailUser = new EmailSubscriber();
const smsUser = new SMSSubscriber();

publisher.attach(emailUser);
publisher.attach(smsUser);

publisher.publishNews("Message 1");
publisher.publishNews("Message 2");
publisher.publishNews("Message 3");
