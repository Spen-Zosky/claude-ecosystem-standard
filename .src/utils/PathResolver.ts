/**
 * CES Portable Path Resolution Utility v2.7.0
 * 
 * Provides dynamic path detection for portable CES installations.
 * Auto-detects CES installation location and manages paths dynamically.
 * 
 * Key Features:
 * - Auto-detection of CES root from any execution context
 * - Singleton pattern for global access
 * - Cross-platform compatibility (Windows/Linux/macOS)
 * - Multiple fallback strategies for robust detection
 * - Support for both subdirectory and standalone installations
 */

import * as path from 'path';
import * as fs from 'fs';

export interface PathDetectionInfo {
  method: 'module_location' | 'marker_files' | 'package_json' | 'environment' | 'fallback';
  certainty: 'high' | 'medium' | 'low';
  timestamp: Date;
  attempts: string[];
}

export interface CESPaths {
  cesRoot: string;
  projectRoot: string;
  cesRelative: string;
}

export class PathResolver {
  private static instance: PathResolver;
  private cesRoot: string = '';
  private projectRoot: string = '';
  private detectionInfo: PathDetectionInfo = {
    method: 'fallback',
    certainty: 'low',
    timestamp: new Date(),
    attempts: []
  };

  private constructor() {
    this.detectPaths();
  }

  public static getInstance(): PathResolver {
    if (!PathResolver.instance) {
      PathResolver.instance = new PathResolver();
    }
    return PathResolver.instance;
  }

  /**
   * Comprehensive path detection using multiple strategies
   */
  private detectPaths(): void {
    const attempts: string[] = [];
    let cesRoot: string | null = null;
    let method: PathDetectionInfo['method'] = 'fallback';
    let certainty: PathDetectionInfo['certainty'] = 'low';

    // Strategy 1: Use environment variable if set
    if (process.env['CES_ROOT']) {
      attempts.push('Environment variable CES_ROOT');
      if (this.validateCesRoot(process.env['CES_ROOT']!)) {
        cesRoot = path.resolve(process.env['CES_ROOT']!);
        method = 'environment';
        certainty = 'high';
      }
    }

    // Strategy 2: Module location-based detection
    if (!cesRoot) {
      attempts.push('Module location detection');
      const moduleBasedRoot = this.detectFromModuleLocation();
      if (moduleBasedRoot && this.validateCesRoot(moduleBasedRoot)) {
        cesRoot = moduleBasedRoot;
        method = 'module_location';
        certainty = 'high';
      }
    }

    // Strategy 3: Marker files detection
    if (!cesRoot) {
      attempts.push('Marker files detection');
      const markerBasedRoot = this.detectFromMarkerFiles();
      if (markerBasedRoot && this.validateCesRoot(markerBasedRoot)) {
        cesRoot = markerBasedRoot;
        method = 'marker_files';
        certainty = 'medium';
      }
    }

    // Strategy 4: Package.json detection
    if (!cesRoot) {
      attempts.push('Package.json detection');
      const packageBasedRoot = this.detectFromPackageJson();
      if (packageBasedRoot && this.validateCesRoot(packageBasedRoot)) {
        cesRoot = packageBasedRoot;
        method = 'package_json';
        certainty = 'medium';
      }
    }

    // Strategy 5: Fallback to current working directory
    if (!cesRoot) {
      attempts.push('Fallback to process.cwd()');
      cesRoot = process.cwd();
      method = 'fallback';
      certainty = 'low';
    }

    this.cesRoot = cesRoot;
    
    // Determine project root based on CES installation type
    this.projectRoot = this.determineProjectRoot(cesRoot);

    this.detectionInfo = {
      method,
      certainty,
      timestamp: new Date(),
      attempts
    };
  }

  /**
   * Detect CES root from module location
   */
  private detectFromModuleLocation(): string | null {
    try {
      // Get the directory of this file
      let currentDir = __dirname;
      
      // Navigate up to find CES root
      // From src/utils/ we need to go up 2 levels to reach CES root
      let candidateRoot = path.resolve(currentDir, '../..');
      
      // Handle compiled vs source execution
      if (currentDir.includes('/dist/')) {
        // Running from compiled code: dist/utils/ -> need to go up 2 levels
        candidateRoot = path.resolve(currentDir, '../..');
      } else if (currentDir.includes('/src/')) {
        // Running from source: src/utils/ -> need to go up 2 levels  
        candidateRoot = path.resolve(currentDir, '../..');
      }

      return candidateRoot;
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect CES root using marker files
   */
  private detectFromMarkerFiles(): string | null {
    const markerFiles = [
      'ces-init-private.sh',
      'init.sh',
      'package.json',
      'CLAUDE.md',
      '.ces.config.json'
    ];

    let currentDir = process.cwd();

    // Search upwards for marker files
    while (currentDir !== path.parse(currentDir).root) {
      const hasMarkers = markerFiles.some(marker => 
        fs.existsSync(path.join(currentDir, marker))
      );

      if (hasMarkers) {
        return currentDir;
      }

      currentDir = path.dirname(currentDir);
    }

    return null;
  }

  /**
   * Detect CES root using package.json
   */
  private detectFromPackageJson(): string | null {
    let currentDir = process.cwd();

    while (currentDir !== path.parse(currentDir).root) {
      const packageJsonPath = path.join(currentDir, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          if (packageJson.name === 'claude-ecosystem-standard' || 
              packageJson.name?.includes('ces') ||
              packageJson.description?.includes('Claude Ecosystem')) {
            return currentDir;
          }
        } catch (error) {
          // Continue searching if package.json is invalid
        }
      }

      currentDir = path.dirname(currentDir);
    }

    return null;
  }

  /**
   * Validate if a directory is a valid CES root
   */
  private validateCesRoot(candidateRoot: string): boolean {
    if (!fs.existsSync(candidateRoot)) {
      return false;
    }

    // Check for essential CES files
    const essentialFiles = [
      'package.json',
      'tsconfig.json'
    ];

    const essentialDirs = [
      'src'
    ];

    const hasEssentialFiles = essentialFiles.some(file => 
      fs.existsSync(path.join(candidateRoot, file))
    );

    const hasEssentialDirs = essentialDirs.some(dir => 
      fs.existsSync(path.join(candidateRoot, dir))
    );

    return hasEssentialFiles || hasEssentialDirs;
  }

  /**
   * Determine project root based on CES installation type
   */
  private determineProjectRoot(cesRoot: string): string {
    const cesBasename = path.basename(cesRoot);
    
    // If CES is installed as a subdirectory named 'ces'
    if (cesBasename === 'ces') {
      return path.dirname(cesRoot);
    }

    // If CES is the project root itself (standalone installation)
    return cesRoot;
  }

  /**
   * Get CES root directory path
   */
  public getCesRoot(): string {
    return this.cesRoot;
  }

  /**
   * Get project root directory path
   */
  public getProjectRoot(): string {
    return this.projectRoot;
  }

  /**
   * Get path relative to CES root
   */
  public getCesPath(...segments: string[]): string {
    return path.join(this.cesRoot, ...segments);
  }

  /**
   * Get path relative to project root  
   */
  public getProjectPath(...segments: string[]): string {
    return path.join(this.projectRoot, ...segments);
  }

  /**
   * Get relative path between two absolute paths
   */
  public getRelativePath(from: string, to: string): string {
    return path.relative(from, to);
  }

  /**
   * Get CES relative path (for project integration)
   */
  public getCesRelativePath(): string {
    return this.getRelativePath(this.projectRoot, this.cesRoot);
  }

  /**
   * Get detection information for debugging
   */
  public getDetectionInfo(): PathDetectionInfo {
    return { ...this.detectionInfo };
  }

  /**
   * Get all computed paths
   */
  public getPaths(): CESPaths {
    return {
      cesRoot: this.cesRoot,
      projectRoot: this.projectRoot,
      cesRelative: this.getCesRelativePath()
    };
  }

  /**
   * Check if running in subdirectory installation mode
   */
  public isSubdirectoryInstallation(): boolean {
    return path.basename(this.cesRoot) === 'ces' && this.cesRoot !== this.projectRoot;
  }

  /**
   * Check if running in standalone installation mode
   */
  public isStandaloneInstallation(): boolean {
    return this.cesRoot === this.projectRoot;
  }

  /**
   * Normalize path for cross-platform compatibility
   */
  public normalizePath(inputPath: string): string {
    return path.normalize(inputPath).replace(/\\/g, '/');
  }

  /**
   * Resolve path relative to CES or project root based on prefix
   */
  public resolvePath(inputPath: string): string {
    if (inputPath.startsWith('ces/')) {
      return this.getCesPath(inputPath.substring(4));
    } else if (inputPath.startsWith('project/')) {
      return this.getProjectPath(inputPath.substring(8));
    } else if (path.isAbsolute(inputPath)) {
      return inputPath;
    } else {
      // Default to CES relative
      return this.getCesPath(inputPath);
    }
  }
}

// Export singleton instance for convenient access
export const getPathResolver = (): PathResolver => PathResolver.getInstance();

// Default export for ES modules
export default PathResolver;