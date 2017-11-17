import { arrayProp, prop, Ref, Typegoose } from 'typegoose'

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

export class Comment {
    @prop() public author: Author
    @prop() public content: string
    @arrayProp({ items: String }) public images: string[]
    @prop() public linkEmbed: LinkEmbed
    @prop() public reactions: Reactions
}

export class Post extends Typegoose {
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

export const PostModel = new Post().getModelForClass(Post, { schemaOptions: { timestamps: true } })

