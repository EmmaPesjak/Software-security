/**
 * Represents a post.
 */
export interface Post {
    postId: number;
    user: string;
    name: string;
    content: string;
    likes: number;
    dislikes: number;
}