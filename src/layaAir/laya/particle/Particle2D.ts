import { ParticleTemplate2D } from "./ParticleTemplate2D";
import { Sprite } from "../display/Sprite";
import { ILaya } from "../../ILaya";
import { Context } from "../resource/Context";
import { EmitterBase } from "./emitter/EmitterBase"
import { Emitter2D } from "./emitter/Emitter2D"
import { DrawParticleCmd } from "../display/cmd/DrawParticleCmd"

/**
 * <code>Particle2D</code> 类是2D粒子播放类
 *
 */
export class Particle2D extends Sprite {
    /**@private */
    private _matrix4: Float32Array = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);//默认4x4矩阵
    private _source: string;
    /**@private */
    private _template: ParticleTemplate2D;
    /**@private */
    private _canvasTemplate: any;
    /**@private */
    private _emitter: EmitterBase;
    /**是否自动播放*/
    autoPlay: boolean = true;

    /**
     * 创建一个新的 <code>Particle2D</code> 类实例。
     * @param setting 粒子配置数据
     */
    constructor() {
        super();
        this.customRenderEnable = true;
    }

    /**
     * 得到粒子模板的地址
     * @return templet.
     */
    get source(): string {
        return this._source;
    }

    /**
     * 
     */
    set source(value: string) {
        this._source = value;

        if (value) {
            ILaya.loader.load(value).then((template: ParticleTemplate2D) => {
                if (template && !template.isCreateFromURL(this._source))
                    return;

                this.init(template);
            });
        }
        else
            this.init(null);
    }

    get template(): ParticleTemplate2D {
        return this._template;
    }

    /**
     * 设置 粒子模板
     * @param value 粒子模板
     */
    set template(value: ParticleTemplate2D) {
        this.init(value);
    }

    /**
     * 获取粒子发射器
     */
    get emitter(): EmitterBase {
        return this._emitter;
    }

    /**
     * 设置粒子配置数据
     * @param settings 粒子配置数据
     */
    init(template: ParticleTemplate2D): void {
        if (this._template) {
            this.reset();
        }

        this._template = template;
        if (!this._template)
            return;

        this._template._addReference();
        this.customRenderEnable = true;//设置custom渲染

        //this.graphics._saveToCmd(Render.context._drawParticle, [_particleTemplate]);
        this.graphics.addCmd(DrawParticleCmd.create((<ParticleTemplate2D>this._template)));
        // canvas 不支持
        if (!this._emitter) {
            this._emitter = new Emitter2D(this._template);
        } else {
            ((<Emitter2D>this._emitter)).template = this._template;
        }
        if (this.autoPlay) {
            this.emitter.start();
            this.play();
        }
    }

    /**
     * 播放
     */
    play(): void {
        ILaya.timer.frameLoop(1, this, this._loop);
    }

    /**
     * 停止
     */
    stop(): void {
        ILaya.timer.clear(this, this._loop);
    }

    /**@private */
    private _loop(): void {
        this.advanceTime(1 / 60);
    }

    /**
     * 时钟前进
     * @param passedTime 时钟前进时间
     */
    advanceTime(passedTime: number = 1): void {
        if (this._canvasTemplate) {
            this._canvasTemplate.advanceTime(passedTime);
        }
        if (this._emitter) {
            this._emitter.advanceTime(passedTime);
        }
    }

    /**
     * 
     * @param context 
     * @param x 
     * @param y 
     * @override
     */
    customRender(context: Context, x: number, y: number): void {
        this._matrix4[0] = context._curMat.a;
        this._matrix4[1] = context._curMat.b;
        this._matrix4[4] = context._curMat.c;
        this._matrix4[5] = context._curMat.d;
        this._matrix4[12] = context._curMat.tx;
        this._matrix4[13] = context._curMat.ty;
        if (!this._template) return;
        var sv: any = ((<ParticleTemplate2D>this._template)).sv;
        sv.u_mmat = this._matrix4;

        if (this._canvasTemplate) {
            this._canvasTemplate.render(context, x, y);
        }
    }

    private reset() {
        this.stop();
    }

    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        if (this._template)
            this.reset();
    }
}