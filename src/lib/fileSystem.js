import fs from 'fs/promises';
import path from 'path';

const PROJECT_ROOT = process.cwd().replace(/workflow-manager$/, '');
const CLAUDE_DIR = path.join(PROJECT_ROOT, '.claude');
const TASKS_FILE = path.join(CLAUDE_DIR, 'tasks.json');
const STORY_TRACKING_FILE = path.join(CLAUDE_DIR, 'stories', 'story-tracking.json');

export async function initializeClaudeStructure() {
  try {
    // Create .claude directory if it doesn't exist
    await fs.mkdir(CLAUDE_DIR, { recursive: true });
    
    // Create subdirectories
    await fs.mkdir(path.join(CLAUDE_DIR, 'agents'), { recursive: true });
    await fs.mkdir(path.join(CLAUDE_DIR, 'stories'), { recursive: true });
    await fs.mkdir(path.join(CLAUDE_DIR, 'architecture'), { recursive: true });
    
    // Remove automatic creation of example files on every initialization
    
    // Initialize tasks.json in .claude directory if it doesn't exist
    try {
      await fs.access(TASKS_FILE);
    } catch {
      await fs.writeFile(TASKS_FILE, JSON.stringify({
        tasks: [],
        columns: ['backlog', 'in-progress', 'review', 'done'],
        lastModified: new Date().toISOString()
      }, null, 2));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing Claude structure:', error);
    return { success: false, error: error.message };
  }
}

export async function readMarkdownFiles(directory) {
  try {
    const dirPath = path.join(CLAUDE_DIR, directory);
    const files = await fs.readdir(dirPath);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    const filesWithContent = await Promise.all(
      markdownFiles.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Add protection information for stories
        let protection = { protected: false, level: 'none' };
        if (directory === 'stories') {
          protection = await isStoryProtected(file);
        }
        
        return {
          name: file,
          path: filePath,
          content,
          slug: file.replace('.md', ''),
          protection
        };
      })
    );
    
    return filesWithContent;
  } catch (error) {
    console.error(`Error reading ${directory} files:`, error);
    return [];
  }
}

export async function writeMarkdownFile(directory, filename, content) {
  try {
    const filePath = path.join(CLAUDE_DIR, directory, filename);
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error writing file:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMarkdownFile(directory, filename) {
  try {
    // Check if story is protected before allowing deletion
    if (directory === 'stories') {
      const protection = await isStoryProtected(filename);
      if (protection.protected) {
        return {
          success: false,
          error: `Cannot delete protected story: ${protection.reason}`,
          protectionLevel: protection.level
        };
      }
    }
    
    const filePath = path.join(CLAUDE_DIR, directory, filename);
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
}

export async function readTasks() {
  try {
    const content = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return { tasks: [], columns: ['backlog', 'in-progress', 'review', 'done'] };
  }
}

export async function writeTasks(tasksData) {
  try {
    tasksData.lastModified = new Date().toISOString();
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasksData, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error writing tasks:', error);
    return { success: false, error: error.message };
  }
}

// Story protection system functions
export async function readStoryTracking() {
  try {
    const content = await fs.readFile(STORY_TRACKING_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading story tracking:', error);
    // Return default structure if file doesn't exist
    return {
      metadata: {
        version: "1.0",
        lastUpdated: new Date().toISOString(),
        description: "Story tracking system with completion status and protection levels"
      },
      stories: {},
      protectionLevels: {
        "none": {
          "description": "Standard story, can be modified or deleted",
          "permissions": ["read", "write", "delete"]
        },
        "not_erasable": {
          "description": "Story cannot be deleted but can be enhanced through new stories",
          "permissions": ["read", "reference_only"]
        }
      },
      statusTypes: {
        "pending": "Story created but not started",
        "in_progress": "Story being actively worked on", 
        "completed": "Story fully implemented and deployed"
      },
      statistics: {
        "totalStories": 0,
        "completedStories": 0,
        "protectedStories": 0
      }
    };
  }
}

export async function writeStoryTracking(trackingData) {
  try {
    trackingData.metadata.lastUpdated = new Date().toISOString();
    await fs.writeFile(STORY_TRACKING_FILE, JSON.stringify(trackingData, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error writing story tracking:', error);
    return { success: false, error: error.message };
  }
}

export async function isStoryProtected(filename) {
  try {
    const tracking = await readStoryTracking();
    const storyKey = filename.replace('.md', '');
    const story = tracking.stories[storyKey];
    
    if (!story) return { protected: false, level: 'none' };
    
    return {
      protected: story.protectionLevel !== 'none',
      level: story.protectionLevel,
      permissions: tracking.protectionLevels[story.protectionLevel]?.permissions || ['read', 'write', 'delete'],
      reason: story.protectionReasons?.[0] || 'Protected story'
    };
  } catch (error) {
    console.error('Error checking story protection:', error);
    return { protected: false, level: 'none' };
  }
}