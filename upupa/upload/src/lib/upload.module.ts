import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { TranslationModule } from '@upupa/language';
import { UploadService } from './upload.service';
import { UploadClient } from "./upload.client";
import { STORAGE_BASE } from './di.token';
import { ImageComponent } from './image.component/image.component';
import { FileSizePipe } from './file-size.pipe';
import { MatTableModule } from '@angular/material/table';
import { ThumbsGridComponent } from './thumbs-grid/thumbs-grid.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UtilsModule } from '@upupa/common';

const declarations = [ImageComponent,
  ThumbsGridComponent,
  FileSizePipe];

@NgModule({
  declarations,
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    MatSidenavModule,
    MatTableModule,
    MatCardModule,
    MatMenuModule,
    UtilsModule,
    MatListModule,
    MatButtonModule,
    MatExpansionModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    TranslationModule
  ],
  exports: declarations,
  bootstrap: []
})
export class UploadModule {

  constructor(@Optional() @SkipSelf() parentModule: UploadModule) {
    // if (parentModule) {
    //   throw new Error('UploadModule is already loaded. Import it in the AppModule only');
    // }
  }

  public static forChild(baseUrl: string): ModuleWithProviders<UploadModule> {
    return {
      ngModule: UploadModule,
      providers: [
        ...declarations,
        UploadService,
        UploadClient,
        {
          provide: STORAGE_BASE,
          useValue: baseUrl
        }
      ]
    };
  }
}
