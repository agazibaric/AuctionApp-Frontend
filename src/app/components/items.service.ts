import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { AppService } from "../service/app.service";
import { Observable, of, throwError } from "rxjs";
import { Item } from "./item/item.component";
import { retry, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ItemsService {
  itemsUrl = "http://localhost:8080/items";
  userItemsUrl = "http://localhost:8080/users/"; // later refactor into string format
  bidUrl = "http://localhost:8080/bid";
  baseUrl = "http://localhost:8080/";

  // Http Headers
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };

  constructor(private auth: AppService, private http: HttpClient) {}

  getItems() {
    return this.http.get(this.itemsUrl + "/search/findByIsExpiredFalse");
  }

  getWonItems() {
    let userId = this.auth.getUserId();
    if (userId === null) return of<any[]>([]);
    return this.http.get(this.userItemsUrl + userId + "/itemsWon");
  }

  getUserItems(): Observable<any> {
    let userId = this.auth.getUserId();
    if (userId === null) return of<any[]>([]);
    return this.http.get(this.userItemsUrl + userId + "/items");
  }

  getHighestBidderItems(): Observable<any> {
    let userId = this.auth.getUserId();
    if (userId === null) return of<any[]>([]);
    return this.http.get(this.userItemsUrl + userId + "/bids");
  }

  getHighestBidder(highestBidderHref) {
    return this.http.get<any>(highestBidderHref);
  }

  createItem(item: Item) {
    return this.http
      .post<Item>(this.itemsUrl, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.errorHandl)
      );
  }

  loadImage(itemId: string): Observable<any> {
    return this.http.get(this.baseUrl + "items/" + itemId + "/image");
  }

  uploadItemImage(itemImage: File, itemId: string) {
    //return this.http.post(this.itemsUrl + "/" + itemId + "/image", itemImage);
    const uploadData = new FormData();
    uploadData.append("imagefile", itemImage, itemImage.name);
    return this.http.post(this.itemsUrl + "/" + itemId + "/image", uploadData);
  }

  errorHandl(error) {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

  itemBid(bid, itemId) {
    console.log("Bidding...");
    let httpParams = new HttpParams()
      .append("itemId", itemId)
      .append("bid", bid);
    this.http.get<any>(this.bidUrl, { params: httpParams }).subscribe(
      data => {
        console.log("Succ bid");
        console.log(data);
      },
      error => {
        console.log("Fail bid");
        console.log(error);
      }
    );
  }
}
