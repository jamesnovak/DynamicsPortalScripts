// <reference path="../angularjs/angular.d.ts" />
"use strict";
var columnDef;
columnDef.aggregationHideLabel = true;
columnDef.aggregationHideLabel = false;
columnDef.aggregationType = 1;
columnDef.aggregationType = function () { return 1; };
columnDef.cellClass = 'test';
columnDef.cellClass = function (grid, gridRow, gridCol, rowIndex, colIndex) {
    //types of grid, gridRow, gridCol, rowIndex and colIndex are flowed in correctly
    return grid.footerHeight + "-" + gridRow.entity.name + "-" + gridCol.field + "-" + (rowIndex + 1) + "-" + (colIndex + 1);
};
columnDef.cellFilter = 'date';
columnDef.cellTemplate = '<div blah="something">hello</div>';
columnDef.cellTooltip = 'blah';
columnDef.cellTooltip = function (gridRow, gridCol) {
    return gridRow.entity.unknownProperty + "-" + gridCol.displayName;
};
columnDef.displayName = 'Jumper';
columnDef.enableColumnMenu = false;
columnDef.enableColumnMenus = false;
columnDef.enableFiltering = true;
columnDef.enableHiding = false;
columnDef.enableSorting = true;
columnDef.field = 'blam';
columnDef.filter = {
    condition: 2,
    term: 'yes',
    placeholder: 'testing',
    ariaLabel: 'testing',
    noTerm: false,
    flags: {
        caseSensitive: true
    },
    type: 1,
    selectOptions: [{ value: 4, label: 'test' }],
    disableCancelFilterButton: false
};
columnDef.filter.condition = function (searchTerm, cellValue, row, column) {
    return true;
};
// the condition function does not need to declare all the parameters
columnDef.filter.condition = function (searchTerm, cellValue) {
    return false;
};
columnDef.filterCellFiltered = false;
columnDef.filterHeaderTemplate = '<div blah="test"></div>';
columnDef.filters = [columnDef.filter];
columnDef.footerCellClass = function (grid, gridRow, gridCol, rowRenderIndex, colRenderIndex) {
    //types for grid, gridRow, gridCol, rowRenderIndex, and colRenderIndex flow in properly
    return grid.footerHeight + "-" + gridRow.entity.age + "-" + (rowRenderIndex + 1) + "-" + gridCol.field + "-" + (colRenderIndex - 1);
};
columnDef.footerCellClass = 'theClass';
columnDef.footerCellFilter = 'currency:$';
columnDef.footerCellTemplate = '<div class="yoshi"></div>';
columnDef.headerCellClass =
    function (grid, gridRow, gridCol, rowRenderIndex, colRenderIndex) {
        //types for grid, gridRow, gridCol, rowRenderIndex, and colRenderIndex flow in properly
        return grid.footerHeight + "-" + gridRow.entity.age + "-" + (rowRenderIndex + 1) + "-" + gridCol.field + "-" + (colRenderIndex - 1);
    };
columnDef.headerCellClass = 'classy';
columnDef.headerCellFilter = 'currency:$';
columnDef.headerCellTemplate = '<div class="yoshi"></div>';
columnDef.headerTooltip = false;
columnDef.headerTooltip = 'The Tooltip';
columnDef.headerTooltip = function (col) {
    //type of col flows in properly
    return col.displayName;
};
columnDef.maxWidth = 200;
columnDef.menuItems = [{
        title: 'title',
        icon: 'ico',
        action: function ($event) {
            alert('click');
        },
        shown: function () { return true; },
        active: function () { return false; },
        context: { a: 'lala' },
        leaveOpen: false
    }];
columnDef.minWidth = 100;
columnDef.name = 'MyColumn';
columnDef.sort = {
    direction: 'ASC',
    ignoreSort: false,
    priority: 1
};
columnDef.sortCellFiltered = false;
columnDef.sortingAlgorithm = function (a, b, rowA, rowB, direction) {
    return -1;
};
columnDef.suppressRemoveSort = false;
columnDef.type = 'Date';
columnDef.visible = true;
columnDef.width = 100;
columnDef.width = '*';
var gridApi;
var gridInstance;
var menuItem;
var colProcessor;
gridApi.core.clearAllFilters(true);
gridApi.core.addToGridMenu(gridInstance, [menuItem]);
gridApi.core.getVisibleRows(gridInstance);
gridApi.core.handleWindowResize();
gridApi.core.queueGridRefresh();
gridApi.core.queueRefresh();
gridApi.core.registerColumnsProcessor(colProcessor, 100);
var gridOptions = {
    data: [{ name: 'Bob', age: 100 }],
    onRegisterApi: function (api) {
        api.selection.on.rowSelectionChanged(null, function (row) {
            console.log(row.entity.name);
        });
    }
};
gridOptions.isRowSelectable = function () { return true; };
var anotherGridInstance;
var rowEntityToScrollTo = {
    anObject: 'inGridOptionsData'
};
var columnDefToScrollTo;
anotherGridInstance.scrollTo();
anotherGridInstance.scrollTo(rowEntityToScrollTo);
anotherGridInstance.scrollTo(rowEntityToScrollTo, columnDefToScrollTo);
var selectedRowEntities = gridApi.selection.getSelectedRows();
var selectedGridRows = gridApi.selection.getSelectedGridRows();
gridApi.expandable.on.rowExpandedStateChanged(null, function (row) {
    if (row.isExpanded) {
        console.log('expanded', row.entity);
    }
    else {
        gridApi.expandable.toggleRowExpansion(row.entity);
    }
});
gridApi.expandable.expandAllRows();
gridApi.expandable.collapseAllRows();
gridApi.expandable.toggleAllRows();
//# sourceMappingURL=ui-grid-tests.js.map