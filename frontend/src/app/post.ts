/**
 * Represents a post.
 */
export interface Post {
    postId: number;
    user: string;
    name: string;
    userName: string;
    content: string;
    likes: number;
    dislikes: number;
}