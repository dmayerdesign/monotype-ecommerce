// @reference https://stackoverflow.com/questions/44077994/angular2-evaluate-template-from-string-inside-a-component
import { CommonModule } from '@angular/common'
import {
    AfterViewInit,
    Compiler,
    Component,
    ComponentRef,
    Directive,
    Input,
    ModuleWithComponentFactories,
    NgModule,
    Type,
    ViewContainerRef,
} from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@Directive({
    selector: '[compile]'
})
export class CompileDirective implements AfterViewInit {
    @Input() public compile: string
    @Input() public compileContext: any

    public componentRef: ComponentRef<any>

    constructor(private vcRef: ViewContainerRef, private compiler: Compiler) {}

    public ngAfterViewInit() {
        if (!this.compile) {
            if (this.componentRef) {
                this.updateProperties()
                return
            }
            throw Error('You forgot to provide a template')
        }

        this.vcRef.clear()
        this.componentRef = null

        const component = this.createDynamicComponent(this.compile)
        const module = this.createDynamicModule(component)
        this.compiler.compileModuleAndAllComponentsAsync(module)
            .then((moduleWithFactories: ModuleWithComponentFactories<any>) => {
                const compFactory = moduleWithFactories.componentFactories.find(x => x.componentType === component)

                this.componentRef = this.vcRef.createComponent(compFactory)
                this.updateProperties()
            })
            .catch(error => {
                console.error(error)
            })
    }

    public updateProperties() {
        Object.keys(this.compileContext).forEach(prop => {
            this.componentRef.instance[prop] = this.compileContext[prop]
        })
    }

    private createDynamicComponent(template: string) {
        @Component({
            selector: 'dynamic-component',
            template: template,
        })
        class CustomDynamicComponent {}
        return CustomDynamicComponent
    }

    private createDynamicModule(component: Type<any>) {
        @NgModule({
            imports: [
                CommonModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            declarations: [component]
        })
        class DynamicModule {}
        return DynamicModule
    }
}

