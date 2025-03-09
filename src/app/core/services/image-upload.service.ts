import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private _cloudinaryUrl =
    'https://api.cloudinary.com/v1_1/ds3bmnf1p/image/upload';

  constructor(private http: HttpClient) {}
  uploadImage(file: File, uploadPreset: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', 'ds3bmnf1p');
    formData.append('folder', 'EasyPost');
    return this.http.post<{ url: string }>(this._cloudinaryUrl, formData).pipe(
      map((response) => {
        return response.url;
      }),
      catchError((error) => {
        console.error('Error uploading image:', error);
        return throwError(() => error);
      })
    );
  }
}
