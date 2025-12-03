import IObserver from "../IObserver.js";
import LibraryCatalogue from "../../singleton/LibraryCatalogue.js";

export default class CatalogueObserver extends IObserver {
  update(book, user) {
    LibraryCatalogue.updateBook(book);
  }
}

