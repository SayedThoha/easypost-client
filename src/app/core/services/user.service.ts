import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  blogData,
  blogResponse,
  httpResponseModel,
  loginHttpResponseModel,
  newPassword,
  profileData,
  userDetails,
  userLogin,
  userRegister,
  verifyOtp,
} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private _http: HttpClient) {}
  private apiUrl: string = environment.apiUrl;

  userRegister(data: userRegister): Observable<httpResponseModel> {
    console.log(data)
    return this._http.post<httpResponseModel>(
      `${this.apiUrl}/user/userRegister`,
      data
    );
  }

  verifyOtp(data: verifyOtp): Observable<httpResponseModel> {
    return this._http.post<httpResponseModel>(
      `${this.apiUrl}/user/verifyOtp`,
      data
    );
  }

  userLogin(data: userLogin): Observable<loginHttpResponseModel> {
    return this._http.post<loginHttpResponseModel>(
      `${this.apiUrl}/user/login`,
      data
    );
  }

  createBlog(data: blogData): Observable<httpResponseModel> {
    return this._http.post<httpResponseModel>(
      `${this.apiUrl}/user/createBlog`,
      data
    );
  }

  editBlog(data: blogData): Observable<httpResponseModel> {
    return this._http.put<httpResponseModel>(
      `${this.apiUrl}/user/editBlog`,
      data
    );
  }

  deleteBlog(blogId: string): Observable<httpResponseModel> {
    return this._http.delete<httpResponseModel>(
      `${this.apiUrl}/user/deleteBlog/${blogId}`
    );
  }

  personalBlogs(userId: string): Observable<blogResponse[]> {
    return this._http.get<blogResponse[]>(
      `${this.apiUrl}/user/personalBlogs/${userId}`
    );
  }

  allBlogs(): Observable<blogResponse[]> {
    return this._http.get<blogResponse[]>(`${this.apiUrl}/user/allBlogs`);
  }

  singleBlog(blogId: string): Observable<blogResponse> {
    return this._http.get<blogResponse>(
      `${this.apiUrl}/user/singleBlog/${blogId}`
    );
  }

  changeProfilePicture(data: profileData): Observable<httpResponseModel> {
    return this._http.post<httpResponseModel>(
      `${this.apiUrl}/user/changeProfilePicture`,
      data
    );
  }

  refreshToken(data: any): Observable<any> {
    return this._http.post(`${this.apiUrl}/auth/refreshToken`, data);
  }

  userDetails(_id: string): Observable<userDetails> {
    return this._http.get<userDetails>(
      `${this.apiUrl}/user/userDetails/${_id}`
    );
  }

  editUserName(data: userDetails): Observable<httpResponseModel> {
    return this._http.patch<httpResponseModel>(
      `${this.apiUrl}/user/editUserName`,
      data
    );
  }

  editUserEmail(data: userDetails): Observable<httpResponseModel> {
    return this._http.post<httpResponseModel>(
      `${this.apiUrl}/user/editUserEmail`,
      data
    );
  }

  verifyEmail(data: Object): Observable<httpResponseModel> {
    return this._http.post<httpResponseModel>(
      `${this.apiUrl}/user/verifyEmail`,
      data
    );
  }

  newPassword(data: newPassword): Observable<httpResponseModel> {
    return this._http.patch<httpResponseModel>(
      `${this.apiUrl}/user/newPassword`,
      data
    );
  }

  resendOtp(email: object): Observable<httpResponseModel> {
    return this._http.post<httpResponseModel>(
      `${this.apiUrl}/user/resendOtp`,
      email
    );
  }
}
