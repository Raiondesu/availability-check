/**
 * Library for storing and editing data
 */

import * as fs from 'fs';
import * as path from 'path';

export default class DataManager {
  constructor(
    public readonly baseDir: string = path.resolve('.data')
  ) {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir);
    }
  }

  /**
   * Writes data to a file
   *
   * @param dir a directory to save to
   * @param file a filename
   * @param data data to save to the file
   */
  public write(file: string, data: any): Promise<void> {
    const fullPath = path.join(this.baseDir, file);

    // Return a promise to allow awaiting the file creation
    return new Promise((resolve, reject) => {

      // Open the file for writing
      fs.open(fullPath + '.json', 'w', (openErr, fileDescriptor) => {
        if (!openErr && fileDescriptor) {
          // Convert data to string
          const stringData = JSON.stringify(data);

          // Write to file
          fs.writeFile(fileDescriptor, stringData, (writingErr) => {
            if (!writingErr) {
              fs.close(fileDescriptor, (closingErr) => {
                if (!closingErr) {
                  resolve();
                } else {
                  reject('Error closing a file. Nested exception: ' + closingErr);
                }
              });
            } else {
              reject('Error writing to new file. Nested exception: ' + writingErr);
            }
          });
        } else if (file.includes('/') && (openErr.code === 'ENOENT' || openErr.errno === -2)) {
          // Create directory if none was found

          // Get normalized dirs
          let dirs = path.normalize(file).split('/');

          try {
            // Remove filename from dirs list
            dirs.splice(dirs.length - 1, 1);

            // Create dirs one after another
            const lastDir = dirs.reduce((prev, cur) => {
              fs.mkdirSync(path.join(this.baseDir, prev));

              return path.join(prev, cur);
            });
            fs.mkdirSync(path.join(this.baseDir, lastDir));

            resolve(this.write(file, data));
          } catch (dirErr) {
            reject('Error creating directory: ' + dirErr);
          }
        } else {
          reject('Could not open a file. Nested exception: ' + openErr);
        }
      });
    });
  }

  /**
   * Reads data from file
   *
   * @param file filename
   * @returns file contents as JSON
   */
  public read(file: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(this.baseDir, file) + '.json', 'UTF-8', (readErr, data) => {
        if (!readErr) {
          resolve(data);
        } else {
          reject('Could not read a file. Nested exception: ' + readErr);
        }
      });
    });
  }

  /**
   * Deletes a file (not a directory tree)
   *
   * @param file a file path to delete the file by
   */
  public delete(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(path.join(this.baseDir, file) + '.json', (deleteErr) => {
        if (!deleteErr) {
          resolve();
        } else {
          reject('Error deleting file:' + deleteErr);
        }
      });
    });
  }

  public static defaultDataManager: DataManager = new DataManager();

  /**
   * Writes data to a file
   *
   * @param dir a directory to save to
   * @param file a filename
   * @param data data to save to the file
   */
  public static write(file: string, data: any): Promise<void> {
    return this.defaultDataManager.write(file, data);
  }

  /**
   * Reads data from file
   *
   * @param file filename
   * @returns file contents as JSON
   */
  public static read(file: string): Promise<any> {
    return this.defaultDataManager.read(file);
  }

  /**
   * Deletes a file (not a directory tree)
   *
   * @param file a file path to delete the file by
   */
  public static delete(file: string): Promise<void> {
    return this.defaultDataManager.delete(file);
  }
}
