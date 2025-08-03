/**
 * PathResolver Tests
 * 
 * Tests for the portable path resolution utility
 */

import * as path from 'path';
import * as fs from 'fs';
import { PathResolver, getPathResolver } from '../utils/PathResolver';

describe('PathResolver', () => {
  let resolver: PathResolver;

  beforeEach(() => {
    resolver = PathResolver.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PathResolver.getInstance();
      const instance2 = PathResolver.getInstance();
      const instance3 = getPathResolver();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(instance3);
    });
  });

  describe('Path Detection', () => {
    it('should detect CES root directory', () => {
      const cesRoot = resolver.getCesRoot();
      
      expect(cesRoot).toBeDefined();
      expect(path.isAbsolute(cesRoot)).toBe(true);
    });

    it('should detect project root directory', () => {
      const projectRoot = resolver.getProjectRoot();
      
      expect(projectRoot).toBeDefined();
      expect(path.isAbsolute(projectRoot)).toBe(true);
    });

    it('should provide detection information', () => {
      const detectionInfo = resolver.getDetectionInfo();
      
      expect(detectionInfo).toHaveProperty('method');
      expect(detectionInfo).toHaveProperty('certainty');
      expect(detectionInfo).toHaveProperty('timestamp');
      expect(detectionInfo).toHaveProperty('attempts');
      expect(Array.isArray(detectionInfo.attempts)).toBe(true);
    });
  });

  describe('Path Resolution', () => {
    it('should resolve CES-relative paths', () => {
      const srcPath = resolver.getCesPath('src');
      const cesRoot = resolver.getCesRoot();
      
      expect(srcPath).toBe(path.join(cesRoot, 'src'));
    });

    it('should resolve project-relative paths', () => {
      const projectPath = resolver.getProjectPath('test');
      const projectRoot = resolver.getProjectRoot();
      
      expect(projectPath).toBe(path.join(projectRoot, 'test'));
    });

    it('should handle multiple path segments', () => {
      const deepPath = resolver.getCesPath('src', 'utils', 'test.ts');
      const cesRoot = resolver.getCesRoot();
      
      expect(deepPath).toBe(path.join(cesRoot, 'src', 'utils', 'test.ts'));
    });

    it('should calculate relative paths correctly', () => {
      const cesRoot = resolver.getCesRoot();
      const projectRoot = resolver.getProjectRoot();
      const relativePath = resolver.getRelativePath(projectRoot, cesRoot);
      
      expect(relativePath).toBeDefined();
    });
  });

  describe('Installation Type Detection', () => {
    it('should detect installation type', () => {
      const isSubdirectory = resolver.isSubdirectoryInstallation();
      const isStandalone = resolver.isStandaloneInstallation();
      
      // Should be either subdirectory or standalone, but not both
      expect(isSubdirectory !== isStandalone).toBe(true);
    });

    it('should provide CES relative path', () => {
      const cesRelativePath = resolver.getCesRelativePath();
      
      expect(cesRelativePath).toBeDefined();
      expect(typeof cesRelativePath).toBe('string');
    });
  });

  describe('Path Utilities', () => {
    it('should normalize paths for cross-platform compatibility', () => {
      const windowsPath = 'C:\\Users\\test\\project';
      const normalized = resolver.normalizePath(windowsPath);
      
      expect(normalized).not.toContain('\\');
      expect(normalized).toContain('/');
    });

    it('should resolve paths with prefixes', () => {
      const cesPath = resolver.resolvePath('ces/src');
      const projectPath = resolver.resolvePath('project/test');
      const absolutePath = resolver.resolvePath('/absolute/path');
      const relativePath = resolver.resolvePath('relative/path');
      
      expect(cesPath).toContain('src');
      expect(projectPath).toContain('test');
      expect(absolutePath).toBe('/absolute/path');
      expect(relativePath).toContain('relative/path');
    });
  });

  describe('Path Information', () => {
    it('should provide comprehensive path information', () => {
      const paths = resolver.getPaths();
      
      expect(paths).toHaveProperty('cesRoot');
      expect(paths).toHaveProperty('projectRoot');
      expect(paths).toHaveProperty('cesRelative');
      
      expect(path.isAbsolute(paths.cesRoot)).toBe(true);
      expect(path.isAbsolute(paths.projectRoot)).toBe(true);
    });
  });

  describe('File System Validation', () => {
    it('should validate that detected paths exist', () => {
      const cesRoot = resolver.getCesRoot();
      const projectRoot = resolver.getProjectRoot();
      
      expect(fs.existsSync(cesRoot)).toBe(true);
      expect(fs.existsSync(projectRoot)).toBe(true);
    });

    it('should detect essential project files', () => {
      const cesRoot = resolver.getCesRoot();
      
      // At least one of these should exist for a valid CES installation
      const essentialFiles = [
        path.join(cesRoot, 'package.json'),
        path.join(cesRoot, 'tsconfig.json'),
        path.join(cesRoot, 'src')
      ];
      
      const hasEssential = essentialFiles.some(file => fs.existsSync(file));
      expect(hasEssential).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty path segments gracefully', () => {
      const emptyPath = resolver.getCesPath('', 'src', '');
      const cesRoot = resolver.getCesRoot();
      
      expect(emptyPath).toBe(path.join(cesRoot, 'src'));
    });

    it('should handle paths with special characters', () => {
      const specialPath = resolver.getCesPath('test@folder#2024!');
      
      expect(specialPath).toContain('test@folder#2024!');
    });
  });
});