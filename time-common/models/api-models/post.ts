import { arrayProp, prop, MongooseDocument, MongooseSchemaOptions, Ref } from '../../lib/goosetype'
import { User } from './user'

export class LinkEmbed {
    @prop() public url: string
    @prop() public type: string
    @prop() public thumbnail_url: string
    @prop() public title: string
    @prop() public description: string
    @prop() public provider_url: string
}

export class Author {
    @prop() public userId: string
    @prop() public firstName: string
    @prop() public lastName: string
}

export class Reactions {
    @arrayProp({ itemsRef: User }) public up: Ref<User>[]
    @arrayProp({ itemsRef: User }) public down: Ref<User>[]
}

export class Comment extends MongooseDocument<Comment> {
    @prop() public author: Author
    @prop() public content: string
    @arrayProp({ items: String }) public images: string[]
    @prop() public linkEmbed: LinkEmbed
    @prop() public reactions: Reactions
}

export class Post extends MongooseDocument<Post> {
    @prop() public author: Author
    @prop({ default: 'normal' }) public type: string
    @prop() public content: Author
    @prop() public eventDate: Date
    @prop() public eventLocation: string
    @arrayProp({ items: String }) public tags: string[]
    @arrayProp({ items: String }) public images: string[]
    @prop() public linkEmbed: LinkEmbed
    @arrayProp({ items: Comment }) public comments: Comment[]
    @prop() public reactions: Reactions
}

export const PostModel = new Post().getModel(MongooseSchemaOptions.Timestamped)
export const CommentModel = new Comment().getModel(MongooseSchemaOptions.Timestamped)

export class CreateCommentError extends Error { }
export class FindCommentError extends Error { }
export class UpdateCommentError extends Error { }
export class DeleteCommentError extends Error { }

export class CreatePostError extends Error { }
export class FindPostError extends Error { }
export class UpdatePostError extends Error { }
export class DeletePostError extends Error { }

