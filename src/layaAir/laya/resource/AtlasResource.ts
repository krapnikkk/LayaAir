import { Resource } from "./Resource";
import { Texture } from "./Texture";

export class AtlasResource extends Resource {
    readonly dir: string;
    readonly textures: Array<Texture>;
    readonly frames: Array<string>;

    constructor(dir: string, textures: Array<Texture>, frames: Array<string>) {
        super();

        this.dir = dir;
        this.textures = textures;
        this.frames = frames;
        this.lock = true;
    }

    protected _disposeResource(): void {
        for (let tex of this.textures)
            tex.destroy();

        this.frames.length = 0;
        this.textures.length = 0;
    }
}