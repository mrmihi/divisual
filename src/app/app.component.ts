// @ts-nocheck
import { Component, AfterViewInit, Renderer2, ElementRef } from '@angular/core';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { NumericTextBoxModule, ColorPickerModule, UploaderModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { SplitButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { DiagramAllModule, SymbolPaletteAllModule, OverviewAllModule } from '@syncfusion/ej2-angular-diagrams';
import { Component, ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { ConnectorConstraints, DiagramComponent, DiagramTools, IExportOptions, IHistoryChangeArgs, ISelectionChangeEventArgs, NodeConstraints, ZoomOptions } from '@syncfusion/ej2-angular-diagrams';
import { ToolbarComponent } from '@syncfusion/ej2-angular-navigations';
import { ClickEventArgs, ItemModel, MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';
import {
  Diagram, NodeModel, UndoRedo, ConnectorModel, PointPortModel, Connector, FlowShapeModel,
  SymbolInfo, IDragEnterEventArgs, SnapSettingsModel, MarginModel, TextStyleModel, StrokeStyleModel,
  OrthogonalSegmentModel, Node, PaletteModel
} from '@syncfusion/ej2-diagrams';
import { ExpandMode } from '@syncfusion/ej2-navigations';
import { paletteIconClick } from './script/diagram-common';
import { AsyncSettingsModel } from '@syncfusion/ej2-inputs';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
  Diagram,
  NodeModel,
  HtmlModel,
  TextStyleModel,
} from '@syncfusion/ej2-diagrams';
import { CommonModule } from '@angular/common';
import { RepairStatusChangeComponent } from './nodes/repair-status-change/repair-status-change.component';

Diagram.Inject(UndoRedo);

/**
 * Default FlowShape sample
 */


@Component({
  standalone: true,
  imports: [CommonModule, DiagramAllModule, SymbolPaletteAllModule, OverviewAllModule, ColorPickerModule, ToolbarModule, DropDownButtonModule, UploaderModule, TextBoxModule, SplitButtonModule, NumericTextBoxModule, TreeViewModule, DropdownModule, FormsModule, ButtonModule, RepairStatusChangeComponent],
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  @ViewChild('diagram')
  //Diagram Properties
  public diagram: DiagramComponent;
  @ViewChild('toolbar')
  public toolbar: ToolbarComponent;
  constructor(private renderer: Renderer2, private el: ElementRef) { }

  public shape: HtmlModel = {
    type:'HTML'
};

public shape1: HtmlModel = {
  type:'HTML',
  content:"<div style='background:red;height:100%;width:100%;'><input type='button' value='{{:value}}' /></div>",
};
  ngAfterViewInit() {
    document.addEventListener("DOMContentLoaded", () => {
      const removingDiv = document.querySelector('div[style*="z-index: 999999999;"]')
      if (removingDiv) {
        removingDiv.parentNode.removeChild(removingDiv);
      }
    });
  }
  
  public terminator: FlowShapeModel = { type: 'Flow', shape: 'Terminator' };
  public process: FlowShapeModel = { type: 'Flow', shape: 'Process' };
  public decision: FlowShapeModel = { type: 'Flow', shape: 'Decision' };
  public data: FlowShapeModel = { type: 'Flow', shape: 'Data' };
  public directdata: FlowShapeModel = { type: 'Flow', shape: 'DirectData' };

  public margin: MarginModel = { left: 25, right: 25 };
  public connAnnotStyle: TextStyleModel = { fill: 'white' };
  public strokeStyle: StrokeStyleModel = { strokeDashArray: '2,2' };

  public segments: OrthogonalSegmentModel = [{ type: 'Orthogonal', direction: 'Top', length: 120 }];
  public segments1: OrthogonalSegmentModel = [
    { type: 'Orthogonal', direction: 'Right', length: 100 }
  ];
  public drawingObject: any;
  public asyncSettings: AsyncSettingsModel = {
    saveUrl: 'https://aspnetmvc.syncfusion.com/services/api/uploadbox/Save',
    removeUrl: 'https://aspnetmvc.syncfusion.com/services/api/uploadbox/Remove'
  };


  public nodeDefaults(node: NodeModel): NodeModel {
    if (node.width === undefined) {
      node.width = 145;
    }
    // node.style = { fill: '#357BD2', strokeColor: 'white' };
    // for (let i: number = 0; i < node.annotations.length; i++) {
    //   node.annotations[i].style = {
    //     color: 'white',
    //     fill: 'transparent',
    //   };
    // }
    node.ports = getPorts(node);
    return node;
  }

  public connDefaults(obj: Connector): void {
    if (obj.id.indexOf('connector') !== -1) {
      obj.targetDecorator = { shape: 'Arrow', width: 10, height: 10 };
    }
  }
  public created(): void {
    this.diagram.fitToPage();
  }
  public interval: number[] = [
    1, 9, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25,
    9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75
  ];

  public snapSettings: SnapSettingsModel = {
    horizontalGridlines: { lineColor: '#e0e0e0', lineIntervals: this.interval },
    verticalGridlines: { lineColor: '#e0e0e0', lineIntervals: this.interval }
  };

  public dragEnter(args: IDragEnterEventArgs): void {
    let obj: NodeModel = args.element as NodeModel;
    if (obj && obj.width && obj.height) {
      let oWidth: number = obj.width;
      let oHeight: number = obj.height;
      let ratio: number = 100 / obj.width;
      obj.width = 100;
      obj.height *= ratio;
      obj.offsetX += (obj.width - oWidth) / 2;
      obj.offsetY += (obj.height - oHeight) / 2;
      obj.style = { fill: '#357BD2', strokeColor: 'white' };
    }
  }

  //SymbolPalette Properties
  public symbolMargin: MarginModel = { left: 15, right: 15, top: 15, bottom: 15 };
  public expandMode: ExpandMode = 'Multiple';
  //Initialize the flowshapes for the symbol palatte
  const htmlrepair: string = '<div style="background-color: #EEF2FF; border-radius: 8px; padding: 10px;"><div style="font-size: 18px; font-weight: bold;">Repair Status Change</div><div style="font-size: 14px; margin-top: 8px;">States changed to</div></div>'
  private flowshapes: NodeModel[] = [
    // { id: 'Terminator', shape: { type: 'Flow', shape: 'Terminator' } },
    // { id: 'Process', shape: { type: 'Flow', shape: 'Process' } },
    // { id: 'Decision', shape: { type: 'Flow', shape: 'Decision' } },
    // { id: 'Document', shape: { type: 'Flow', shape: 'Document' } },
    // { id: 'PreDefinedProcess', shape: { type: 'Flow', shape: 'PreDefinedProcess' } },
    // { id: 'PaperTap', shape: { type: 'Flow', shape: 'PaperTap' } },
    // { id: 'DirectData', shape: { type: 'Flow', shape: 'DirectData' } },
    // { id: 'SequentialData', shape: { type: 'Flow', shape: 'SequentialData' } },
    // { id: 'Sort', shape: { type: 'Flow', shape: 'Sort' } },
    // { id: 'MultiDocument', shape: { type: 'Flow', shape: 'MultiDocument' } },
    // { id: 'Collate', shape: { type: 'Flow', shape: 'Collate' } },
    // { id: 'SummingJunction', shape: { type: 'Flow', shape: 'SummingJunction' } },
    // { id: 'Or', shape: { type: 'Flow', shape: 'Or' } },
    // {
    //   id: 'InternalStorage',
    //   shape: { type: 'Flow', shape: 'InternalStorage' }
    // },
    // { id: 'Extract', shape: { type: 'Flow', shape: 'Extract' } },
    // {
    //   id: 'ManualOperation',
    //   shape: { type: 'Flow', shape: 'ManualOperation' }
    // },
    // { id: 'Merge', shape: { type: 'Flow', shape: 'Merge' } },
    // {
    //   id: 'OffPageReference',
    //   shape: { type: 'Flow', shape: 'OffPageReference' }
    // },
    // {
    //   id: 'SequentialAccessStorage',
    //   shape: { type: 'Flow', shape: 'SequentialAccessStorage' }
    // },
    // { id: 'Annotation', shape: { type: 'Flow', shape: 'Annotation' } },
    // { id: 'Annotation2', shape: { type: 'Flow', shape: 'Annotation2' } },
    // { id: 'Data', shape: { type: 'Flow', shape: 'Data' } },
    // { id: 'Card', shape: { type: 'Flow', shape: 'Card' } },
    // { id: 'Delay', shape: { type: 'Flow', shape: 'Delay' } },
  ];

  //Initializes connector symbols for the symbol palette
  private connectorSymbols: ConnectorModel[] = [
    {
      id: 'Link1',
      type: 'Orthogonal',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 60, y: 60 },
      targetDecorator: { shape: 'Arrow', style: { strokeColor: '#757575', fill: '#757575' } },
      style: { strokeWidth: 1, strokeColor: '#757575' }
    },
    {
      id: 'link3',
      type: 'Orthogonal',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 60, y: 60 },
      style: { strokeWidth: 1, strokeColor: '#757575' },
      targetDecorator: { shape: 'None' }
    },
    {
      id: 'Link21',
      type: 'Straight',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 60, y: 60 },
      targetDecorator: { shape: 'Arrow', style: { strokeColor: '#757575', fill: '#757575' } },
      style: { strokeWidth: 1, strokeColor: '#757575' }
    },
    {
      id: 'link23',
      type: 'Straight',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 60, y: 60 },
      style: { strokeWidth: 1, strokeColor: '#757575' },
      targetDecorator: { shape: 'None' }
    },
    {
      id: 'link33',
      type: 'Bezier',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 60, y: 60 },
      style: { strokeWidth: 1, strokeColor: '#757575' },
      targetDecorator: { shape: 'None' }
    }
  ];

  private nodes: NodeModel[] = [
    {
      id: "Repair1",
      shape: {
        type: "HTML",
        content:
          '<p-button label="Submit">Hello</p-button>'
      }
    },
    {
      id: "Repair",
      shape: {
        type: "HTML",
        content:
          '<div style="background-color: #EEF2FF; border-radius: 8px; padding: 10px;"><div style="font-size: 18px; font-weight: bold;">Repair Status Change</div><div style="font-size: 14px; margin-top: 8px;">States changed to</div><p-dropdown placeholder="In Progress"></p-dropdown></div>'
      }
    }
  ];
  public palettes: PaletteModel[] = [
    {
      id: "html",
      expanded: true,
      symbols: this.nodes,
      iconCss: "shapes",
      title: "HTML Shapes"
    },
    {
      id: 'flow',
      expanded: true,
      symbols: this.flowshapes,
      iconCss: 'shapes',
      title: 'Flow Shapes'
    },
    {
      id: 'connectors',
      expanded: true,
      symbols: this.connectorSymbols,
      iconCss: 'shapes',
      title: 'Connectors'
    }
  ];

  public getSymbolInfo(symbol: NodeModel): SymbolInfo {
    return { fit: true };
  }

  public getSymbolDefaults(symbol: NodeModel): void {
    symbol.style.strokeColor = '#757575';
    if (symbol.id === 'Terminator' || symbol.id === 'Process') {
      symbol.width = 80;
      symbol.height = 40;
    } else if (
      symbol.id === 'Decision' ||
      symbol.id === 'Document' ||
      symbol.id === 'PreDefinedProcess' ||
      symbol.id === 'PaperTap' ||
      symbol.id === 'DirectData' ||
      symbol.id === 'MultiDocument' ||
      symbol.id === 'Data'
    ) {
      symbol.width = 50;
      symbol.height = 40;
    } else {
      symbol.width = 50;
      symbol.height = 50;
    }
  }
  public selectionChange(args: ISelectionChangeEventArgs): void {
    if (args.state === 'Changed') {
      var selectedItems = this.diagram.selectedItems.nodes;
      selectedItems = selectedItems.concat(this.diagram.selectedItems.connectors as any);
      if (selectedItems.length === 0) {
        this.toolbar.items[6].disabled = true;
        this.toolbar.items[7].disabled = true;
        this.toolbar.items[19].disabled = true;
        this.toolbar.items[20].disabled = true;
        this.toolbar.items[25].disabled = true;
        this.toolbar.items[29].disabled = true;
        this.toolbar.items[31].disabled = true;
        this.disableMultiselectedItems();
      }
      if (selectedItems.length === 1) {

        this.enableItems();
        this.disableMultiselectedItems();

        if (selectedItems[0].children !== undefined && selectedItems[0].children.length > 0) {
          this.toolbar.items[27].disabled = false;
        }
        else {
          this.toolbar.items[27].disabled = true;
        }

      }

      if (selectedItems.length > 1) {
        this.enableItems();
        this.toolbar.items[22].disabled = false;
        this.toolbar.items[23].disabled = false;
        this.toolbar.items[27].disabled = false;
        if (selectedItems.length > 2) {
          this.toolbar.items[23].disabled = false;
        }
        else {
          this.toolbar.items[23].disabled = true;
        }
      }

    }
  }
  public historyChange(args: IHistoryChangeArgs): void {
    if (this.diagram.historyManager.undoStack.length > 0) {
      this.toolbar.items[10].disabled = false;
    }
    else {
      this.toolbar.items[10].disabled = true;
    }
    if (this.diagram.historyManager.redoStack.length > 0) {
      this.toolbar.items[11].disabled = false;
    }
    else {
      this.toolbar.items[11].disabled = true;
    }
  }
  public enableItems() {
    this.toolbar.items[6].disabled = false;
    this.toolbar.items[7].disabled = false;
    this.toolbar.items[19].disabled = false;
    this.toolbar.items[20].disabled = false;
    this.toolbar.items[25].disabled = false;
    this.toolbar.items[29].disabled = false;
    this.toolbar.items[31].disabled = false;
  }
  public disableMultiselectedItems() {
    this.toolbar.items[22].disabled = true;
    this.toolbar.items[23].disabled = true;
    this.toolbar.items[27].disabled = true;
  }

  public clicked(args: ClickEventArgs) {
    var item = (args as any).item.tooltipText;
    switch (item) {
      case 'Undo':
        this.diagram.undo();
        break;
      case 'Redo':
        this.diagram.redo();
        break;
      case 'Lock':
        this.lockObject();
        break;
      case 'Cut':
        this.diagram.cut();
        this.toolbar.items[8].disabled = false;
        break;
      case 'Copy':
        this.diagram.copy();
        this.toolbar.items[8].disabled = false;
        break;
      case 'Paste':
        this.diagram.paste();
        break;
      case 'Delete':
        this.diagram.remove();
        break;
      case 'Select Tool':
        this.diagram.clearSelection();
        this.diagram.tool = DiagramTools.Default;
        break;
      case 'Text Tool':
        this.diagram.clearSelection();
        this.diagram.selectedItems.userHandles = [];
        this.diagram.drawingObject = { shape: { type: 'Text' }, };
        this.diagram.tool = DiagramTools.ContinuousDraw;
        break;
      case 'Pan Tool':
        this.diagram.clearSelection();
        this.diagram.tool = DiagramTools.ZoomPan;
        break;
      case 'New Diagram':
        this.diagram.clear();
        this.historyChange(args as any);
        break;
      case 'Print Diagram':
        this.printDiagram(args);
        break;
      case 'Save Diagram':
        this.download(this.diagram.saveDiagram());
        break;
      case 'Open Diagram':
        document.getElementsByClassName('e-file-select-wrap')[0].querySelector('button').click();
        break;
    }
    this.diagram.dataBind();
  }


  public zoomMenuItems = [
    { text: 'Zoom In' },
    { text: 'Zoom Out' }, { text: 'Zoom to Fit' },
    { text: 'Zoom to 50%' },
    { text: 'Zoom to 100%' },
    { text: 'Zoom to 200%' },
  ]

  // To perform zoom operation
  public zoomChange(args) {
    var currentZoom = this.diagram.scrollSettings.currentZoom;
    var zoom: ZoomOptions = {};
    switch (args.item.text) {
      case 'Zoom In':
        this.diagram.zoomTo({ type: 'ZoomIn', zoomFactor: 0.2 });
        break;
      case 'Zoom Out':
        this.diagram.zoomTo({ type: 'ZoomOut', zoomFactor: 0.2 });
        break;
      case 'Zoom to Fit':
        zoom.zoomFactor = 1 / currentZoom - 1;
        this.diagram.zoomTo(zoom);
        break;
      case 'Zoom to 50%':
        if (currentZoom === 0.5) {
          currentZoom = 0;
          zoom.zoomFactor = (0.5 / currentZoom) - 1;
          this.diagram.zoomTo(zoom);

        }
        else {
          zoom.zoomFactor = (0.5 / currentZoom) - 1;
          this.diagram.zoomTo(zoom);
        }
        break;

      case 'Zoom to 100%':
        if (currentZoom === 1) {
          currentZoom = 0;
          zoom.zoomFactor = (1 / currentZoom) - 1;
          this.diagram.zoomTo(zoom);
        }
        else {
          zoom.zoomFactor = (1 / currentZoom) - 1;
          this.diagram.zoomTo(zoom);
        }
        break;
      case 'Zoom to 200%':
        if (currentZoom === 2) {
          currentZoom = 0;
          zoom.zoomFactor = (2 / currentZoom) - 1;
          this.diagram.zoomTo(zoom);
        }
        else {
          zoom.zoomFactor = (2 / currentZoom) - 1;
          this.diagram.zoomTo(zoom);
        }
        break;
    }
  }

  public onConnectorSelect(args: any) {
    debugger
    this.diagram.clearSelection();
    this.diagram.drawingObject = { type: args.item.text };
    this.diagram.tool = DiagramTools.ContinuousDraw;
    this.diagram.selectedItems.userHandles = [];
    this.diagram.dataBind();
  }
  public conTypeItems = [
    { text: 'Straight', iconCss: 'e-icons e-line' },
    { text: 'Orthogonal', iconCss: 'sf-icon-orthogonal' },
    { text: 'Bezier', iconCss: 'sf-icon-bezier' }
  ];

  public shapesItems = [
    { text: 'Rectangle', iconCss: 'e-rectangle e-icons' },
    { text: 'Ellipse', iconCss: ' e-circle e-icons' },
    { text: 'Polygon', iconCss: 'e-line e-icons' }
  ];

  public onShapesSelect(args) {
    this.diagram.clearSelection();
    this.diagram.drawingObject = { shape: { shape: args.item.text } };
    this.diagram.tool = DiagramTools.ContinuousDraw;
    this.diagram.selectedItems.userHandles = [];
    this.diagram.dataBind();
  }
  //Export the diagraming object based on the format.

  public groupItems = [
    { text: 'Group', iconCss: 'e-icons e-group-1' },
    { text: 'Ungroup', iconCss: 'e-icons e-ungroup-1' }
  ];
  public onSelectGroup(args) {
    if (args.item.text === 'Group') {
      this.diagram.group();
    }
    else if (args.item.text === 'Ungroup') {
      this.diagram.unGroup();
    }
  }

  public alignItems = [
    {
      iconCss: 'sf-icon-align-left-1', text: 'Align Left',
    },
    {
      iconCss: 'sf-icon-align-center-1', text: 'Align Center',
    },
    {
      iconCss: 'sf-icon-align-right-1', text: 'Align Right',
    },
    {
      iconCss: 'sf-icon-align-top-1', text: 'Align Top',
    },
    {
      iconCss: 'sf-icon-align-middle-1', text: 'Align Middle',
    },
    {
      iconCss: 'sf-icon-align-bottom-1', text: 'Align Bottom',
    },
  ];

  public onSelectAlignObjects(args) {
    var item = args.item.text;
    var alignType = item.replace('Align', '');
    var alignType1 = alignType.charAt(0).toUpperCase() + alignType.slice(1);
    this.diagram.align(alignType1.trim());
  }
  public distributeItems = [
    { iconCss: 'sf-icon-distribute-vertical', text: 'Distribute Objects Vertically', },
    { iconCss: 'sf-icon-distribute-horizontal', text: 'Distribute Objects Horizontally', },
  ];

  public onSelectDistributeObjects(args) {
    if (args.item.text === 'Distribute Objects Vertically') {
      this.diagram.distribute('BottomToTop');
    }
    else {
      this.diagram.distribute('RightToLeft');
    }
  }

  public orderItems = [
    { iconCss: 'e-icons e-bring-forward', text: 'Bring Forward' },
    { iconCss: 'e-icons e-bring-to-front', text: 'Bring To Front' },
    { iconCss: 'e-icons e-send-backward', text: 'Send Backward' },
    { iconCss: 'e-icons e-send-to-back', text: 'Send To Back' }
  ];
  public onSelectOrder(args) {
    switch (args.item.text) {
      case 'Bring Forward':
        this.diagram.moveForward();
        break;
      case 'Bring To Front':
        this.diagram.bringToFront();
        break;
      case 'Send Backward':
        this.diagram.sendBackward();
        break;
      case 'Send To Back':
        this.diagram.sendToBack();
        break;
    }
  }

  public rotateItems = [
    { iconCss: 'e-icons e-transform-right', text: 'Rotate Clockwise' },
    { iconCss: 'e-icons e-transform-left', text: 'Rotate Counter-Clockwise' }
  ];


  public onSelectRotate(args) {
    if (args.item.text === 'Rotate Clockwise') {
      this.diagram.rotate(this.diagram.selectedItems, 90);
    }
    else {
      this.diagram.rotate(this.diagram.selectedItems, -90);
    }
  }

  public flipItems = [
    { iconCss: 'e-icons e-flip-horizontal', text: 'Flip Horizontal' },
    { iconCss: 'e-icons e-flip-vertical', text: 'Flip Vertical' }
  ];
  public onSelectFlip(args) {
    this.flipObjects(args.item.text);
  }

  // To flip diagram objects
  public flipObjects(flipType) {
    var selectedObjects = this.diagram.selectedItems.nodes.concat(this.diagram.selectedItems.connectors as any);
    for (let i: number = 0; i < selectedObjects.length; i++) {
      selectedObjects[i].flip = flipType === 'Flip Horizontal' ? 'Horizontal' : 'Vertical';
    }
    this.diagram.dataBind();
  }
  public lockObject() {
    for (let i: number = 0; i < this.diagram.selectedItems.nodes.length; i++) {
      let node = this.diagram.selectedItems.nodes[i];
      if (node.constraints & NodeConstraints.Drag) {
        node.constraints = NodeConstraints.PointerEvents | NodeConstraints.Select;
      } else {
        node.constraints = NodeConstraints.Default;
      }
    }
    for (let j: number = 0; j < this.diagram.selectedItems.connectors.length; j++) {
      let connector = this.diagram.selectedItems.connectors[j];
      if (connector.constraints & ConnectorConstraints.Drag) {
        connector.constraints = ConnectorConstraints.PointerEvents | ConnectorConstraints.Select;
      } else {
        connector.constraints = ConnectorConstraints.Default;
      }
    }
    this.diagram.dataBind();
  }
  public zoomContent() {
    return Math.round(this.diagram.scrollSettings.currentZoom * 100) + ' %'
  };
  public printDiagram(args) {
    var options: IExportOptions = {};
    options.mode = 'Download';
    options.region = 'Content';
    options.multiplePage = this.diagram.pageSettings.multiplePage;
    options.pageHeight = this.diagram.pageSettings.height;
    options.pageWidth = this.diagram.pageSettings.width;
    this.diagram.print(options);
  }
  public onselectExport(args) {
    var exportOptions: IExportOptions = {};
    exportOptions.format = args.item.text;
    exportOptions.mode = 'Download';
    exportOptions.region = 'PageSettings';
    exportOptions.fileName = 'Export';
    exportOptions.margin = { left: 0, top: 0, bottom: 0, right: 0 };
    this.diagram.exportDiagram(exportOptions);
  }

  public download(data: string): void {
    if ((window.navigator as any).msSaveBlob) {
      let blob: Blob = new Blob([data], { type: 'data:text/json;charset=utf-8,' });
      window.navigator.msSaveOrOpenBlob(blob, 'Diagram.json');
    } else {
      let dataStr: string = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
      let a: HTMLAnchorElement = document.createElement('a');
      a.href = dataStr;
      a.download = 'Diagram.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }
  public onUploadSuccess(args: { [key: string]: Object }): void {
    debugger
    let file1: { [key: string]: Object } = args.file as { [key: string]: Object };
    let file: Blob = file1.rawFile as Blob;
    let reader: FileReader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = this.loadDiagram.bind(this);
  }

  public loadDiagram(event: ProgressEvent): void {
    this.diagram.loadDiagram((event.target as FileReader).result.toString());
  }

  public items: ItemModel[] = [
    { text: 'JPG' }, { text: 'PNG' }, { text: 'SVG' }

  ];
  public addDisabled(args: MenuEventArgs) {
    this.onselectExport(args);
  }

  public diagramCreate(args: Object): void {
    paletteIconClick();
  }
}

function getPorts(obj: NodeModel): PointPortModel[] {
  let ports: PointPortModel[] = [
    { id: 'port1', shape: 'Circle', offset: { x: 0, y: 0.5 } },
    { id: 'port2', shape: 'Circle', offset: { x: 0.5, y: 1 } },
    { id: 'port3', shape: 'Circle', offset: { x: 1, y: 0.5 } },
    { id: 'port4', shape: 'Circle', offset: { x: 0.5, y: 0 } }
  ];
  return ports;
}