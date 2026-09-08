import * as THREE from 'three';

import { OrbitControls } 
    from 'three/addons/controls/OrbitControls.js';

import { PointerLockControls } 
    from 'three/addons/controls/PointerLockControls.js';


// ============================================================
// V-ULPIN 3D PROPERTY MAPPING SYSTEM
// ============================================================


// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x07101f);

scene.fog = new THREE.Fog(
    0x07101f,
    100,
    240
);


// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    72,
    window.innerWidth / window.innerHeight,
    0.1,
    1500
);

camera.position.set(
    65,
    55,
    65
);


// ============================================================
// RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.15;

document.body.appendChild(
    renderer.domElement
);


// ============================================================
// LIGHTING
// ============================================================

const hemisphereLight =
    new THREE.HemisphereLight(
        0xbfd8ff,
        0x182235,
        2.2
    );

scene.add(
    hemisphereLight
);


const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.2
    );

scene.add(
    ambientLight
);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        3.5
    );

sun.position.set(
    50,
    100,
    40
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -120;
sun.shadow.camera.right = 120;
sun.shadow.camera.top = 120;
sun.shadow.camera.bottom = -120;

scene.add(
    sun
);


// ============================================================
// ORBIT CONTROLS
// ============================================================

const orbitControls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

orbitControls.enableDamping = true;

orbitControls.dampingFactor = 0.05;

orbitControls.mouseButtons.LEFT =
    THREE.MOUSE.ROTATE;

orbitControls.mouseButtons.RIGHT =
    THREE.MOUSE.PAN;

orbitControls.mouseButtons.MIDDLE =
    THREE.MOUSE.DOLLY;

orbitControls.enableZoom = true;

orbitControls.minDistance = 12;

orbitControls.maxDistance = 190;

orbitControls.maxPolarAngle =
    Math.PI / 2.05;

orbitControls.target.set(
    0,
    5,
    0
);


// ============================================================
// FIRST PERSON CONTROLS
// ============================================================

const firstPersonControls =
    new PointerLockControls(
        camera,
        renderer.domElement
    );

let firstPersonMode = false;

let movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
};

let firstPersonTarget = null;
let firstPersonTargetType = null;
let targetOutline = null;
let matrixXrayMeshes = [];
let matrixXrayShell = null;
let matrixFocusState = null;
let matrixModeActive = false;
let matrixFocusBuilding = null;
let matrixEnvironmentState = null;

let velocity =
    new THREE.Vector3();

let direction =
    new THREE.Vector3();


// ============================================================
// CITY DATA
// ============================================================

const buildings = [];

const pickables = [];

let selectedBuilding = null;

let selectedFloor = null;

let selectedUnit = null;

let highlightedMeshes = [];


// ============================================================
// GROUND
// ============================================================

const groundGeometry =
    new THREE.PlaneGeometry(
        180,
        180
    );

const groundMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111c2e,
        roughness: 0.95
    });

const ground =
    new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

ground.rotation.x =
    -Math.PI / 2;

ground.position.y = -0.2;

ground.receiveShadow = true;

scene.add(
    ground
);


// ============================================================
// GRID
// ============================================================

const grid =
    new THREE.GridHelper(
        180,
        36,
        0x29405f,
        0x17253a
    );

grid.position.y = -0.08;

grid.material.transparent = true;

grid.material.opacity = 0.45;

scene.add(
    grid
);


// ============================================================
// ROADS
// ============================================================

function createRoad(
    x,
    z,
    width,
    depth
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            0.18,
            depth
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x202c40,
            roughness: 0.85
        });

    const road =
        new THREE.Mesh(
            geometry,
            material
        );

    road.position.set(
        x,
        -0.02,
        z
    );

    road.receiveShadow = true;

    scene.add(
        road
    );
}


for (
    let z = -60;
    z <= 60;
    z += 30
) {

    createRoad(
        0,
        z,
        180,
        9
    );
}


for (
    let x = -60;
    x <= 60;
    x += 30
) {

    createRoad(
        x,
        0,
        9,
        180
    );
}


// ============================================================
// ROAD MARKINGS
// ============================================================

function createRoadMarkings() {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xcbd5e1
        });


    for (
        let z = -60;
        z <= 60;
        z += 30
    ) {

        for (
            let x = -82;
            x < 82;
            x += 10
        ) {

            const geometry =
                new THREE.BoxGeometry(
                    5,
                    0.04,
                    0.18
                );

            const mark =
                new THREE.Mesh(
                    geometry,
                    material
                );

            mark.position.set(
                x,
                0.08,
                z
            );

            scene.add(
                mark
            );
        }
    }


    for (
        let x = -60;
        x <= 60;
        x += 30
    ) {

        for (
            let z = -82;
            z < 82;
            z += 10
        ) {

            const geometry =
                new THREE.BoxGeometry(
                    0.18,
                    0.04,
                    5
                );

            const mark =
                new THREE.Mesh(
                    geometry,
                    material
                );

            mark.position.set(
                x,
                0.08,
                z
            );

            scene.add(
                mark
            );
        }
    }
}

createRoadMarkings();


// ============================================================
// TREES
// ============================================================

function createTree(
    x,
    z,
    scale = 1
) {

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.25 * scale,
            0.38 * scale,
            2 * scale,
            8
        );

    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x69452d
        });

    const trunk =
        new THREE.Mesh(
            trunkGeometry,
            trunkMaterial
        );

    trunk.position.set(
        x,
        scale,
        z
    );

    trunk.castShadow = true;

    scene.add(
        trunk
    );


    const leavesGeometry =
        new THREE.SphereGeometry(
            1.6 * scale,
            12,
            12
        );

    const leavesMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            roughness: 0.8
        });

    const leaves =
        new THREE.Mesh(
            leavesGeometry,
            leavesMaterial
        );

    leaves.position.set(
        x,
        3 * scale,
        z
    );

    leaves.castShadow = true;

    scene.add(
        leaves
    );
}


// ============================================================
// PARK
// ============================================================

function createPark(
    x,
    z
) {

    const geometry =
        new THREE.BoxGeometry(
            22,
            0.25,
            22
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x14532d
        });

    const park =
        new THREE.Mesh(
            geometry,
            material
        );

    park.position.set(
        x,
        0,
        z
    );

    park.receiveShadow = true;

    scene.add(
        park
    );


    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const treeX =
            x +
            Math.random() * 17 -
            8.5;

        const treeZ =
            z +
            Math.random() * 17 -
            8.5;

        createTree(
            treeX,
            treeZ,
            0.8 +
            Math.random() * 0.4
        );
    }
}

createPark(
    45,
    45
);


// ============================================================
// BUILDING TEXT LABEL
// ============================================================

function createTextSprite(
    text
) {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 512;

    canvas.height = 128;

    const ctx =
        canvas.getContext(
            "2d"
        );

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.font =
        "bold 52px Arial";

    ctx.fillStyle =
        "#e2e8f0";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        text,
        canvas.width / 2,
        canvas.height / 2
    );

    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    texture.colorSpace =
        THREE.SRGBColorSpace;

    const material =
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

    const sprite =
        new THREE.Sprite(
            material
        );

    sprite.scale.set(
        7,
        1.75,
        1
    );

    return sprite;
}


// ============================================================
// PARCEL
// ============================================================

function createParcel(
    building,
    width,
    depth
) {

    const points = [

        new THREE.Vector3(
            -width / 2,
            0.06,
            -depth / 2
        ),

        new THREE.Vector3(
            width / 2,
            0.06,
            -depth / 2
        ),

        new THREE.Vector3(
            width / 2,
            0.06,
            depth / 2
        ),

        new THREE.Vector3(
            -width / 2,
            0.06,
            depth / 2
        )
    ];


    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                points
            );


    const material =
        new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.55
        });


    const line =
        new THREE.LineLoop(
            geometry,
            material
        );

    building.add(
        line
    );
}


// ============================================================
// BUILDING CREATION
// ============================================================

function createBuilding(
    number,
    x,
    z,
    floors
) {

    const width = 14;

    const depth = 10;

    const floorHeight = 3.2;

    const unitCount = 3;

    const unitWidth = 4.25;

    const unitDepth = 8.5;

    const unitHeight = 2.65;


    const building =
        new THREE.Group();

    building.position.set(
        x,
        0,
        z
    );


    const buildingId =
        `B-${String(number).padStart(3, "0")}`;


    const buildingULPIN =
        `UK-AG-001-${buildingId}`;


    building.userData = {

        type: "building",

        buildingId,

        ulpin: buildingULPIN,

        floors,

        unitsPerFloor: unitCount,

        area:
            `${width * depth} m² footprint`,

        status: "Verified",

        width,

        depth
    };


    createParcel(
        building,
        width + 2,
        depth + 2
    );


    const floorsData = [];


    // --------------------------------------------------------
    // FLOORS
    // --------------------------------------------------------

    for (
        let floorIndex = 0;
        floorIndex < floors;
        floorIndex++
    ) {

        const floorNumber =
            floorIndex + 1;


        const floorULPIN =
            `${buildingULPIN}-F${String(
                floorNumber
            ).padStart(2, "0")}`;


        const floorGroup =
            new THREE.Group();


        floorGroup.userData = {

            type: "floor",

            building,

            buildingId,

            floor:
                floorNumber,

            ulpin:
                floorULPIN
        };


        // Floor slab

        const slabGeometry =
            new THREE.BoxGeometry(
                width,
                0.18,
                depth
            );


        const slabMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x334155,
                roughness: 0.75
            });


        const slab =
            new THREE.Mesh(
                slabGeometry,
                slabMaterial
            );


        slab.position.y =
            floorIndex *
            floorHeight +
            0.1;


        slab.userData = {

            type: "floor",

            building,

            floorGroup,

            floor:
                floorNumber,

            ulpin:
                floorULPIN,

            buildingId
        };


        slab.castShadow = true;

        slab.receiveShadow = true;


        floorGroup.add(
            slab
        );


        pickables.push(
            slab
        );


        const floorUnits = [];


        // ----------------------------------------------------
        // UNITS
        // ----------------------------------------------------

        for (
            let unitIndex = 0;
            unitIndex < unitCount;
            unitIndex++
        ) {

            const unitLetter =
                String.fromCharCode(
                    65 + unitIndex
                );


            const unitULPIN =
                `${floorULPIN}-U${String(
                    unitIndex + 1
                ).padStart(2, "0")}`;


            const unitGeometry =
                new THREE.BoxGeometry(
                    unitWidth,
                    unitHeight,
                    unitDepth
                );


            const colors = [
                0x64748b,
                0x718096,
                0x52627a
            ];


            const unitMaterial =
                new THREE.MeshStandardMaterial({

                    color:
                        colors[
                            unitIndex
                        ],

                    roughness: 0.65,

                    metalness: 0.05
                });


            const unit =
                new THREE.Mesh(
                    unitGeometry,
                    unitMaterial
                );


            const startX =
                -unitWidth;


            const unitX =
                startX +
                unitIndex *
                (unitWidth + 0.1) +
                unitWidth / 2;


            unit.position.set(

                unitX,

                floorIndex *
                    floorHeight +
                    1.45,

                0
            );


            const unitData = {

                type: "unit",

                building,

                floorGroup,

                floor:
                    floorNumber,

                unit:
                    unitLetter,

                unitIndex,

                ulpin:
                    unitULPIN,

                buildingId,

                floorULPIN,

                area:
                    `${Math.round(
                        unitWidth *
                        unitDepth
                    )} m²`,

                status:
                    "Verified"
            };


            unit.userData =
                unitData;


            unit.castShadow = true;

            unit.receiveShadow = true;


            floorGroup.add(
                unit
            );


            pickables.push(
                unit
            );


            floorUnits.push(
                unit
            );
        }


        // ----------------------------------------------------
        // FLOOR LABEL
        // ----------------------------------------------------

        const floorLabel =
            createTextSprite(
                `F${floorNumber}`
            );


        floorLabel.position.set(
            width / 2 + 2,
            floorIndex *
                floorHeight +
                1.6,
            0
        );


        floorGroup.add(
            floorLabel
        );


        floorsData.push({
            floor:
                floorNumber,

            ulpin:
                floorULPIN,

            group:
                floorGroup,

            units:
                floorUnits
        });


        building.add(
            floorGroup
        );
    }


    // --------------------------------------------------------
    // BUILDING LABEL
    // --------------------------------------------------------

    const buildingLabel =
        createTextSprite(
            buildingId
        );


    buildingLabel.position.set(
        0,
        floors *
            floorHeight +
            2,
        0
    );


    building.add(
        buildingLabel
    );


    building.userData.floorsData =
        floorsData;


    buildings.push(
        building
    );


    scene.add(
        building
    );


    return building;
}


// ============================================================
// CITY BUILDINGS
// ============================================================

createBuilding(
    1,
    -45,
    -45,
    4
);

createBuilding(
    2,
    -15,
    -45,
    5
);

createBuilding(
    3,
    15,
    -45,
    3
);

createBuilding(
    4,
    45,
    -45,
    6
);

createBuilding(
    5,
    -45,
    -15,
    5
);

createBuilding(
    6,
    -15,
    -15,
    4
);

createBuilding(
    7,
    15,
    -15,
    6
);

createBuilding(
    8,
    45,
    -15,
    3
);

createBuilding(
    9,
    -45,
    15,
    6
);

createBuilding(
    10,
    -15,
    15,
    3
);

createBuilding(
    11,
    15,
    15,
    5
);

createBuilding(
    12,
    45,
    15,
    4
);

createBuilding(
    13,
    -45,
    45,
    4
);

createBuilding(
    14,
    -15,
    45,
    6
);

createBuilding(
    15,
    15,
    45,
    5
);


// ============================================================
// RAYCASTER
// ============================================================

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


// ============================================================
// PROPERTY INSPECTOR
// ============================================================

function getElement(
    id
) {

    return document.getElementById(
        id
    );
}


function showInspector(
    html
) {

    const inspector =
        getElement(
            "inspector"
        );

    const property =
        getElement(
            "property"
        );

    if (!inspector || !property) {
        return;
    }

    property.innerHTML =
        html;

    inspector.classList.add(
        "visible"
    );
}


function hideInspector() {

    const inspector =
        getElement(
            "inspector"
        );

    if (!inspector) {
        return;
    }

    inspector.classList.remove(
        "visible"
    );
}


// ============================================================
// BUILDING SELECTION
// ============================================================

function clearHighlights() {

    highlightedMeshes.forEach(
        mesh => {

            if (
                mesh &&
                mesh.material &&
                mesh.material.emissive
            ) {

                mesh.material.emissive
                    .setHex(
                        mesh.userData
                            .originalEmissive ||
                        0x000000
                    );
            }
        }
    );


    highlightedMeshes = [];
}


function highlightBuilding(
    building
) {

    clearHighlights();


    building.traverse(
        object => {

            if (
                object.isMesh &&
                object.material &&
                object.material.emissive
            ) {

                if (
                    object.userData
                        .originalEmissive ===
                    undefined
                ) {

                    object.userData
                        .originalEmissive =
                        object.material
                            .emissive
                            .getHex();
                }


                object.material.emissive
                    .setHex(
                        0x1d4ed8
                    );


                highlightedMeshes.push(
                    object
                );
            }
        }
    );
}


function selectBuilding(
    building
) {

    if (!building) {
        return;
    }


    selectedBuilding =
        building;

    selectedFloor = null;

    selectedUnit = null;


    highlightBuilding(
        building
    );


    const data =
        building.userData;


    showInspector(`

        <div class="property-title">
            Building ${data.buildingId}
        </div>

        <div class="property-row">
            <span>ULPIN</span>
            <strong>${data.ulpin}</strong>
        </div>

        <div class="property-row">
            <span>Floors</span>
            <strong>${data.floors}</strong>
        </div>

        <div class="property-row">
            <span>Units / Floor</span>
            <strong>${data.unitsPerFloor}</strong>
        </div>

        <div class="property-row">
            <span>Footprint</span>
            <strong>${data.area}</strong>
        </div>

        <div class="property-row">
            <span>Status</span>
            <strong>${data.status}</strong>
        </div>

        <button
            class="inspect-button"
            id="matrixButton"
        >
            Open Matrix View
        </button>
    `);


    const matrixButton =
        getElement(
            "matrixButton"
        );


    if (matrixButton) {

        matrixButton.addEventListener(
            "click",
            () => {
                openMatrix(
                    building
                );
            }
        );
    }


    if (
        matrixModeActive &&
        building !==
            matrixFocusBuilding
    ) {

        openMatrix(
            building
        );
    }
}


// ============================================================
// FLOOR SELECTION
// ============================================================

function selectFloor(
    floorObject
) {

    if (!floorObject) {
        return;
    }


    let floorGroup =
        floorObject;


    if (
        floorObject.userData &&
        floorObject.userData.floorGroup
    ) {

        floorGroup =
            floorObject.userData
                .floorGroup;
    }


    const data =
        floorGroup.userData;


    if (!data || data.type !== "floor") {
        return;
    }


    selectedFloor =
        floorGroup;


    selectedUnit = null;


    const building =
        data.building;


    selectedBuilding =
        building;


    highlightBuilding(
        building
    );


    floorGroup.traverse(
        object => {

            if (
                object.isMesh &&
                object.material &&
                object.material.emissive
            ) {

                object.material.emissive
                    .setHex(
                        0x2563eb
                    );

                highlightedMeshes.push(
                    object
                );
            }
        }
    );


    showInspector(`

        <div class="property-title">
            Floor ${data.floor}
        </div>

        <div class="property-row">
            <span>Floor ULPIN</span>
            <strong>${data.ulpin}</strong>
        </div>

        <div class="property-row">
            <span>Building</span>
            <strong>${data.buildingId}</strong>
        </div>

        <div class="property-row">
            <span>Units</span>
            <strong>${building.userData.unitsPerFloor}</strong>
        </div>

        <button
            class="inspect-button"
            id="matrixButton"
        >
            Open Matrix View
        </button>
    `);


    const matrixButton =
        getElement(
            "matrixButton"
        );


    if (matrixButton) {

        matrixButton.addEventListener(
            "click",
            () => {
                openMatrix(
                    building
                );
            }
        );
    }


    if (
        matrixModeActive &&
        building !==
            matrixFocusBuilding
    ) {

        openMatrix(
            building
        );
    }
}


// ============================================================
// UNIT SELECTION
// ============================================================

function selectUnit(
    unit
) {

    if (!unit) {
        return;
    }


    const data =
        unit.userData;


    if (
        !data ||
        data.type !== "unit"
    ) {
        return;
    }


    selectedUnit =
        unit;


    selectedBuilding =
        data.building;


    selectedFloor =
        data.floorGroup;


    clearHighlights();


    if (
        unit.material &&
        unit.material.emissive
    ) {

        if (
            unit.userData
                .originalEmissive ===
            undefined
        ) {

            unit.userData
                .originalEmissive =
                unit.material
                    .emissive
                    .getHex();
        }


        unit.material.emissive
            .setHex(
                0x22d3ee
            );


        highlightedMeshes.push(
            unit
        );
    }


    showInspector(`

        <div class="property-title">
            Unit ${data.unit}
        </div>

        <div class="property-row">
            <span>Unit ULPIN</span>
            <strong>${data.ulpin}</strong>
        </div>

        <div class="property-row">
            <span>Floor</span>
            <strong>F${data.floor}</strong>
        </div>

        <div class="property-row">
            <span>Building</span>
            <strong>${data.buildingId}</strong>
        </div>

        <div class="property-row">
            <span>Area</span>
            <strong>${data.area}</strong>
        </div>

        <div class="property-row">
            <span>Status</span>
            <strong>${data.status}</strong>
        </div>

        <button
            class="inspect-button"
            id="matrixButton"
        >
            Open Matrix View
        </button>
    `);


    const matrixButton =
        getElement(
            "matrixButton"
        );


    if (matrixButton) {

        matrixButton.addEventListener(
            "click",
            () => {
                openMatrix(
                    data.building
                );
            }
        );
    }


    if (
        matrixModeActive &&
        data.building !==
            matrixFocusBuilding
    ) {

        openMatrix(
            data.building
        );
    }
}


// ============================================================
// GENERAL CLICK SELECTION
// ============================================================

function selectObject(
    object
) {

    if (!object) {
        return;
    }


    let current =
        object;


    while (
        current &&
        current !== scene
    ) {

        if (
            current.userData &&
            current.userData.type
        ) {

            const type =
                current.userData.type;


            if (type === "unit") {

                selectUnit(
                    current
                );

                return;
            }


            if (type === "floor") {

                selectFloor(
                    current
                );

                return;
            }


            if (type === "building") {

                selectBuilding(
                    current
                );

                return;
            }
        }


        current =
            current.parent;
    }
}


// ============================================================
// MOUSE EVENTS
// ============================================================

window.addEventListener(
    "pointerdown",
    event => {

        if (firstPersonMode) {
            return;
        }


        const rect =
            renderer.domElement
                .getBoundingClientRect();


        mouse.x =
            (
                event.clientX -
                rect.left
            ) /
            rect.width *
            2 -
            1;


        mouse.y =
            -(
                event.clientY -
                rect.top
            ) /
            rect.height *
            2 +
            1;


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const intersections =
            raycaster.intersectObjects(
                pickables,
                true
            );


        if (
            intersections.length
        ) {

            selectObject(
                intersections[0]
                    .object
            );
        }
    }
);


// ============================================================
// SEARCH
// ============================================================

const searchInput =
    getElement(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const value =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!value) {
                return;
            }


            const match =
                buildings.find(
                    building => {

                        const data =
                            building.userData;


                        return (
                            data.buildingId
                                .toLowerCase()
                                .includes(value) ||

                            data.ulpin
                                .toLowerCase()
                                .includes(value)
                        );
                    }
                );


            if (match) {

                selectBuilding(
                    match
                );


                const box =
                    new THREE.Box3()
                        .setFromObject(
                            match
                        );


                const center =
                    box.getCenter(
                        new THREE.Vector3()
                    );


                orbitControls.target.copy(
                    center
                );


                camera.position.set(
                    center.x + 25,
                    center.y + 18,
                    center.z + 25
                );
            }
        }
    );
}


// ============================================================
// FIRST PERSON HUD
// ============================================================

function createFirstPersonHUD() {

    if (
        getElement(
            "fps-crosshair"
        )
    ) {
        return;
    }


    const crosshair =
        document.createElement(
            "div"
        );


    crosshair.id =
        "fps-crosshair";


    crosshair.innerHTML = `
        <span></span>
    `;


    document.body.appendChild(
        crosshair
    );


    const targetPanel =
        document.createElement(
            "div"
        );


    targetPanel.id =
        "targetPanel";


    targetPanel.innerHTML = `

        <div class="target-label">
            TARGET
        </div>

        <div
            id="targetBuilding"
            class="target-building"
        >
            —
        </div>

        <div
            id="targetInfo"
            class="target-info"
        >
            Look at a building
        </div>

        <div
            id="targetULPIN"
            class="target-ulpin"
        >
            —
        </div>

        <button
            id="inspectTarget"
            class="inspect-target-button"
        >
            INSPECT · E
        </button>
    `;


    document.body.appendChild(
        targetPanel
    );


    const inspectButton =
        getElement(
            "inspectTarget"
        );


    if (inspectButton) {

        inspectButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                inspectCurrentTarget();
            }
        );
    }
}


// ============================================================
// FIRST PERSON TARGET DETAILS
// ============================================================

function getTargetDetails(
    object
) {

    let current =
        object;


    while (
        current &&
        current !== scene
    ) {

        if (
            current.userData &&
            current.userData.type
        ) {

            const type =
                current.userData.type;


            if (
                type === "unit" ||
                type === "floor" ||
                type === "building"
            ) {

                return {
                    object: current,
                    type,
                    data: current.userData
                };
            }
        }


        current =
            current.parent;
    }


    return null;
}


// ============================================================
// TARGET OUTLINE
// ============================================================

function removeTargetOutline() {

    if (
        targetOutline
    ) {

        scene.remove(
            targetOutline
        );


        targetOutline.geometry.dispose();

        targetOutline.material.dispose();


        targetOutline =
            null;
    }
}


function updateTargetOutline(
    target
) {

    removeTargetOutline();


    if (!target) {
        return;
    }


    const box =
        new THREE.Box3()
            .setFromObject(
                target
            );


    if (box.isEmpty()) {
        return;
    }


    targetOutline =
        new THREE.Box3Helper(
            box,
            0x38bdf8
        );


    scene.add(
        targetOutline
    );
}


// ============================================================
// FPS TARGET DETECTION
// ============================================================

function updateTargetDetection() {

    if (!firstPersonMode) {
        return;
    }


    const direction =
        new THREE.Vector3();


    camera.getWorldDirection(
        direction
    );


    raycaster.set(
        camera.position,
        direction
    );


    raycaster.far = 80;


    const intersections =
        raycaster.intersectObjects(
            buildings,
            true
        );


    let details = null;


    for (
        let i = 0;
        i < intersections.length;
        i++
    ) {

        const candidate =
            getTargetDetails(
                intersections[i]
                    .object
            );


        if (
            candidate &&
            (
                candidate.type ===
                "building" ||

                candidate.type ===
                "floor" ||

                candidate.type ===
                "unit"
            )
        ) {

            details =
                candidate;

            break;
        }
    }


    const targetPanel =
        getElement(
            "targetPanel"
        );


    const targetBuilding =
        getElement(
            "targetBuilding"
        );


    const targetInfo =
        getElement(
            "targetInfo"
        );


    const targetULPIN =
        getElement(
            "targetULPIN"
        );


    if (!details) {

        firstPersonTarget =
            null;

        firstPersonTargetType =
            null;


        removeTargetOutline();


        if (targetPanel) {

            targetPanel.classList.remove(
                "active"
            );
        }


        return;
    }


    let building =
        details.data.building;


    if (
        details.type ===
        "building"
    ) {

        building =
            details.object;
    }


    firstPersonTarget =
        building;

    firstPersonTargetType =
        details.type;


    updateTargetOutline(
        building
    );


    if (targetPanel) {

        targetPanel.classList.add(
            "active"
        );
    }


    if (targetBuilding) {

        if (
            details.type ===
            "building"
        ) {

            targetBuilding.textContent =
                `Building ${
                    details.data.buildingId
                }`;

        } else if (
            details.type ===
            "floor"
        ) {

            targetBuilding.textContent =
                `Floor ${
                    details.data.floor
                } · ${
                    details.data.buildingId
                }`;

        } else {

            targetBuilding.textContent =
                `Unit ${
                    details.data.unit
                } · ${
                    details.data.buildingId
                }`;
        }
    }


    if (targetInfo) {

        if (
            details.type ===
            "building"
        ) {

            targetInfo.textContent =
                `${details.data.floors} floors · ${details.data.unitsPerFloor} units/floor`;

        } else if (
            details.type ===
            "floor"
        ) {

            targetInfo.textContent =
                `Floor ${details.data.floor} · ${
                    building.userData.unitsPerFloor
                } units`;

        } else {

            targetInfo.textContent =
                `Floor ${details.data.floor} · ${
                    details.data.area
                }`;
        }
    }


    if (targetULPIN) {

        targetULPIN.textContent =
            details.data.ulpin;
    }
}


// ============================================================
// SELECT FPS TARGET
// ============================================================

function selectFirstPersonTarget() {

    if (!firstPersonMode) {
        return;
    }


    if (!firstPersonTarget) {
        return;
    }


    if (
        firstPersonTargetType ===
        "unit"
    ) {

        const direction =
            new THREE.Vector3();


        camera.getWorldDirection(
            direction
        );


        raycaster.set(
            camera.position,
            direction
        );


        raycaster.far = 80;


        const intersections =
            raycaster.intersectObjects(
                buildings,
                true
            );


        for (
            const intersection
            of intersections
        ) {

            const details =
                getTargetDetails(
                    intersection.object
                );


            if (
                details &&
                details.type ===
                "unit"
            ) {

                selectUnit(
                    details.object
                );

                return;
            }
        }
    }


    selectBuilding(
        firstPersonTarget
    );
}


// ============================================================
// INSPECT CURRENT TARGET
// ============================================================

function inspectCurrentTarget() {

    if (!firstPersonMode) {
        return;
    }


    if (!firstPersonTarget) {
        return;
    }


    const direction =
        new THREE.Vector3();


    camera.getWorldDirection(
        direction
    );


    raycaster.set(
        camera.position,
        direction
    );


    raycaster.far = 80;


    const intersections =
        raycaster.intersectObjects(
            buildings,
            true
        );


    for (
        const intersection
        of intersections
    ) {

        const details =
            getTargetDetails(
                intersection.object
            );


        if (!details) {
            continue;
        }


        if (
            details.type ===
            "unit"
        ) {

            selectUnit(
                details.object
            );


            openMatrix(
                details.data.building
            );


            return;
        }


        if (
            details.type ===
            "floor"
        ) {

            selectFloor(
                details.object
            );


            openMatrix(
                details.data.building
            );


            return;
        }


        if (
            details.type ===
            "building"
        ) {

            selectBuilding(
                details.object
            );


            openMatrix(
                details.object
            );


            return;
        }
    }


    openMatrix(
        firstPersonTarget
    );
}


// ============================================================
// KEYBOARD CONTROLS
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code ===
            "KeyW"
        ) {

            movement.forward =
                true;
        }


        if (
            event.code ===
            "KeyS"
        ) {

            movement.backward =
                true;
        }


        if (
            event.code ===
            "KeyA"
        ) {

            movement.left =
                true;
        }


        if (
            event.code ===
            "KeyD"
        ) {

            movement.right =
                true;
        }


        if (
            event.code ===
            "ShiftLeft" ||
            event.code ===
            "ShiftRight"
        ) {

            movement.sprint =
                true;
        }


        if (
            event.code ===
            "KeyE"
        ) {

            if (
                firstPersonMode
            ) {

                inspectCurrentTarget();
            }
        }
    }
);


document.addEventListener(
    "keyup",
    event => {

        if (
            event.code ===
            "KeyW"
        ) {

            movement.forward =
                false;
        }


        if (
            event.code ===
            "KeyS"
        ) {

            movement.backward =
                false;
        }


        if (
            event.code ===
            "KeyA"
        ) {

            movement.left =
                false;
        }


        if (
            event.code ===
            "KeyD"
        ) {

            movement.right =
                false;
        }


        if (
            event.code ===
            "ShiftLeft" ||
            event.code ===
            "ShiftRight"
        ) {

            movement.sprint =
                false;
        }
    }
);


// ============================================================
// FPS CLICK / POINTER LOCK
// ============================================================

renderer.domElement.addEventListener(
    "click",
    () => {

        if (
            firstPersonMode &&
            !firstPersonControls.isLocked
        ) {

            firstPersonControls.lock();

            return;
        }


        if (
            firstPersonMode &&
            firstPersonControls.isLocked
        ) {

            selectFirstPersonTarget();
        }
    }
);


// ============================================================
// POINTER LOCK EVENTS
// ============================================================

firstPersonControls.addEventListener(
    "lock",
    () => {

        if (!firstPersonMode) {
            return;
        }


        document.body.classList.add(
            "fps-active"
        );
    }
);


firstPersonControls.addEventListener(
    "unlock",
    () => {

        if (!firstPersonMode) {
            return;
        }


        movement.forward =
            false;

        movement.backward =
            false;

        movement.left =
            false;

        movement.right =
            false;

        movement.sprint =
            false;
    }
);


// ============================================================
// FPS MOVEMENT
// ============================================================

function updateFirstPersonMovement(
    delta
) {

    if (
        !firstPersonMode ||
        !firstPersonControls.isLocked
    ) {

        return;
    }


    const speed =
        movement.sprint
            ? 27
            : 14;


    direction.set(
        0,
        0,
        0
    );


    if (
        movement.forward
    ) {

        direction.z -= 1;
    }


    if (
        movement.backward
    ) {

        direction.z += 1;
    }


    if (
        movement.left
    ) {

        direction.x -= 1;
    }


    if (
        movement.right
    ) {

        direction.x += 1;
    }


    if (
        direction.lengthSq() ===
        0
    ) {

        velocity.x *=
            Math.pow(
                0.001,
                delta
            );

        velocity.z *=
            Math.pow(
                0.001,
                delta
            );

    } else {

        direction.normalize();


        velocity.x =
            direction.x *
            speed;

        velocity.z =
            direction.z *
            speed;
    }


    firstPersonControls.moveRight(
        velocity.x * delta
    );


    firstPersonControls.moveForward(
        -velocity.z * delta
    );


    // Human eye height

    camera.position.y =
        2.2;
}


// ============================================================
// MATRIX VIEW STYLES
// ============================================================

function createMatrixStyles() {

    if (
        getElement(
            "matrixStyles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "matrixStyles";


    style.textContent = `

        #fps-crosshair {
            position: fixed;
            left: 50%;
            top: 50%;
            width: 24px;
            height: 24px;
            transform:
                translate(-50%, -50%);
            z-index: 9999;
            pointer-events: none;
            display: none;
        }

        #fps-crosshair::before,
        #fps-crosshair::after {
            content: "";
            position: absolute;
            background: rgba(
                255,
                255,
                255,
                0.95
            );
            box-shadow:
                0 0 8px
                rgba(
                    56,
                    189,
                    248,
                    0.85
                );
        }

        #fps-crosshair::before {
            width: 20px;
            height: 2px;
            left: 2px;
            top: 11px;
        }

        #fps-crosshair::after {
            width: 2px;
            height: 20px;
            left: 11px;
            top: 2px;
        }

        #fps-crosshair span {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            left: 10px;
            top: 10px;
            background: #ffffff;
        }

        body.fps-active
        #fps-crosshair {
            display: block;
        }

        #targetPanel {
            position: fixed;
            left: 50%;
            bottom: 90px;
            transform:
                translateX(-50%)
                translateY(15px);
            min-width: 290px;
            max-width: 440px;
            padding: 16px 18px;
            border-radius: 14px;
            background:
                rgba(
                    7,
                    16,
                    31,
                    0.88
                );
            border:
                1px solid
                rgba(
                    56,
                    189,
                    248,
                    0.45
                );
            box-shadow:
                0 16px 50px
                rgba(
                    0,
                    0,
                    0,
                    0.35
                );
            backdrop-filter:
                blur(18px);
            z-index: 9998;
            opacity: 0;
            pointer-events: none;
            transition:
                opacity .18s ease,
                transform .18s ease;
        }

        #targetPanel.active {
            opacity: 1;
            transform:
                translateX(-50%)
                translateY(0);
        }

        .target-label {
            font-size: 10px;
            letter-spacing: 2px;
            color: #38bdf8;
            font-weight: 800;
            margin-bottom: 5px;
        }

        .target-building {
            font-size: 17px;
            font-weight: 800;
            color: #f8fafc;
        }

        .target-info {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 4px;
        }

        .target-ulpin {
            font-family: monospace;
            font-size: 11px;
            color: #67e8f9;
            margin-top: 8px;
            word-break: break-all;
        }

        .inspect-target-button {
            margin-top: 11px;
            width: 100%;
            border: 0;
            border-radius: 8px;
            padding: 9px 12px;
            background:
                rgba(
                    56,
                    189,
                    248,
                    0.15
                );
            color: #e0f2fe;
            border:
                1px solid
                rgba(
                    56,
                    189,
                    248,
                    0.35
                );
            cursor: pointer;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: .5px;
        }

        .inspect-target-button:hover {
            background:
                rgba(
                    56,
                    189,
                    248,
                    0.25
                );
        }

        #matrixOverlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: none;
            align-items: stretch;
            justify-content: flex-end;
            padding: 18px;
            pointer-events: none;
        }

        #matrixOverlay.active {
            display: flex;
        }

        #matrixWindow {
            pointer-events: auto;
            width: min(
                360px,
                90vw
            );
            max-height: 100%;
            border-radius: 18px;
            overflow: hidden;
            background:
                linear-gradient(
                    145deg,
                    rgba(
                        15,
                        23,
                        42,
                        0.94
                    ),
                    rgba(
                        7,
                        16,
                        31,
                        0.96
                    )
                );
            border:
                1px solid
                rgba(
                    57,
                    255,
                    20,
                    0.35
                );
            box-shadow:
                0 20px 70px
                rgba(
                    0,
                    0,
                    0,
                    0.5
                );
            display: flex;
            flex-direction: column;
        }

        #matrixHeader {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 22px;
            border-bottom:
                1px solid
                rgba(
                    148,
                    163,
                    184,
                    0.12
                );
        }

        #matrixTitle {
            font-size: 18px;
            font-weight: 850;
            color: #f8fafc;
        }

        #matrixULPIN {
            font-family: monospace;
            font-size: 11px;
            color: #67e8f9;
            margin-top: 4px;
        }

        #closeMatrix {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            border: 1px solid
                rgba(
                    148,
                    163,
                    184,
                    0.2
                );
            background:
                rgba(
                    255,
                    255,
                    255,
                    0.04
                );
            color: #cbd5e1;
            cursor: pointer;
            font-size: 20px;
        }

        #closeMatrix:hover {
            background:
                rgba(
                    255,
                    255,
                    255,
                    0.09
                );
        }

        #matrixContent {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }

        #matrixFloors {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 14px 18px;
            border-bottom:
                1px solid
                rgba(
                    148,
                    163,
                    184,
                    0.12
                );
        }

        .matrix-floor {
            flex: 0 0 auto;
            min-width: 110px;
            padding: 13px 14px;
            margin-bottom: 8px;
            border-radius: 11px;
            border: 1px solid
                rgba(
                    148,
                    163,
                    184,
                    0.13
                );
            background:
                rgba(
                    255,
                    255,
                    255,
                    0.025
                );
            color: #cbd5e1;
            text-align: left;
            cursor: pointer;
        }

        .matrix-floor:hover,
        .matrix-floor.active {
            border-color:
                rgba(
                    56,
                    189,
                    248,
                    0.5
                );
            background:
                rgba(
                    56,
                    189,
                    248,
                    0.1
                );
            color: #f8fafc;
        }

        .matrix-floor-number {
            font-size: 13px;
            font-weight: 800;
        }

        .matrix-floor-ulpin {
            margin-top: 4px;
            font-size: 9px;
            font-family: monospace;
            color: #64748b;
            word-break: break-all;
        }

        #matrixDetails {
            position: relative;
            overflow: auto;
            padding: 25px;
        }

        .matrix-scene {
            min-height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .matrix-building {
            position: relative;
            width: min(
                700px,
                100%
            );
            margin: auto;
            padding: 22px;
            border-radius: 18px;
            border: 1px solid
                rgba(
                    56,
                    189,
                    248,
                    0.22
                );
            background:
                rgba(
                    2,
                    6,
                    23,
                    0.55
                );
        }

        .matrix-floor-stack {
            display: flex;
            flex-direction: column-reverse;
            gap: 12px;
        }

        .matrix-floor-block {
            padding: 14px;
            border-radius: 12px;
            border: 1px solid
                rgba(
                    148,
                    163,
                    184,
                    0.14
                );
            background:
                rgba(
                    100,
                    116,
                    139,
                    0.08
                );
        }

        .matrix-floor-block.selected {
            border-color:
                rgba(
                    34,
                    211,
                    238,
                    0.7
                );
            box-shadow:
                0 0 25px
                rgba(
                    34,
                    211,
                    238,
                    0.12
                );
        }

        .matrix-unit-grid {
            display: grid;
            grid-template-columns:
                repeat(
                    3,
                    1fr
                );
            gap: 8px;
            margin-top: 10px;
        }

        .matrix-unit {
            padding: 12px 8px;
            border-radius: 9px;
            background:
                rgba(
                    100,
                    116,
                    139,
                    0.2
                );
            border: 1px solid
                rgba(
                    148,
                    163,
                    184,
                    0.15
                );
            cursor: pointer;
        }

        .matrix-unit:hover,
        .matrix-unit.selected {
            border-color:
                rgba(
                    34,
                    211,
                    238,
                    0.65
                );
            background:
                rgba(
                    34,
                    211,
                    238,
                    0.12
                );
        }

        .matrix-unit-name {
            font-size: 12px;
            font-weight: 850;
            color: #f8fafc;
        }

        .matrix-unit-ulpin {
            margin-top: 4px;
            font-family: monospace;
            font-size: 8px;
            color: #67e8f9;
            word-break: break-all;
        }

        .matrix-detail-card {
            margin-top: 18px;
            width: 100%;
            padding: 16px;
            border-radius: 12px;
            background:
                rgba(
                    255,
                    255,
                    255,
                    0.035
                );
            border: 1px solid
                rgba(
                    148,
                    163,
                    184,
                    0.12
                );
        }

        .matrix-detail-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.4px;
            color: #38bdf8;
            font-weight: 800;
            margin-bottom: 8px;
        }

        .matrix-detail-value {
            color: #f8fafc;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
        }

        @media (
            max-width: 760px
        ) {

            #matrixWindow {
                width: min(
                    92vw,
                    360px
                );
            }

            .matrix-unit-grid {
                grid-template-columns:
                    repeat(
                        3,
                        1fr
                    );
            }
        }
    `;


    document.head.appendChild(
        style
    );
}


createMatrixStyles();


// ============================================================
// MATRIX OVERLAY CREATION
// ============================================================

function createMatrixOverlay() {

    if (
        getElement(
            "matrixOverlay"
        )
    ) {

        return;
    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "matrixOverlay";


    overlay.innerHTML = `

        <div id="matrixWindow">

            <div id="matrixHeader">

                <div>

                    <div
                        id="matrixTitle"
                    >
                        3D Property Matrix
                    </div>

                    <div
                        id="matrixULPIN"
                    >
                        —
                    </div>

                </div>

                <button
                    id="closeMatrix"
                    type="button"
                >
                    ×
                </button>

            </div>

            <div id="matrixContent">

                <div
                    id="matrixFloors"
                ></div>

                <div
                    id="matrixDetails"
                ></div>

            </div>

        </div>
    `;


    document.body.appendChild(
        overlay
    );


    const closeButton =
        getElement(
            "closeMatrix"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeMatrix
        );
    }


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                closeMatrix();
            }
        }
    );
}


// ============================================================
// MATRIX X-RAY
// ============================================================

function restoreMatrixXray() {

    matrixXrayMeshes.forEach(
        entry => {

            if (
                entry &&
                entry.mesh &&
                entry.original
            ) {

                if (
                    entry.mesh.material &&
                    entry.mesh.material !==
                        entry.original &&
                    entry.mesh.material.dispose
                ) {

                    entry.mesh.material.dispose();
                }

                entry.mesh.material =
                    entry.original;
            }
        }
    );


    matrixXrayMeshes =
        [];


    if (
        matrixXrayShell
    ) {

        scene.remove(
            matrixXrayShell
        );


        if (
            matrixXrayShell.geometry
        ) {

            matrixXrayShell
                .geometry
                .dispose();
        }


        if (
            matrixXrayShell.material
        ) {

            matrixXrayShell
                .material
                .dispose();
        }


        matrixXrayShell =
            null;
    }


    if (
        matrixEnvironmentState
    ) {

        grid.material.color.setHex(
            matrixEnvironmentState
                .gridColor
        );

        grid.material.opacity =
            matrixEnvironmentState
                .gridOpacity;


        scene.background.setHex(
            matrixEnvironmentState
                .backgroundColor
        );

        scene.fog.color.setHex(
            matrixEnvironmentState
                .fogColor
        );


        matrixEnvironmentState =
            null;
    }
}


// ============================================================
// APPLY X-RAY MATERIALS
// ============================================================

// Matrix-style x-ray color used for every building except the
// one currently in focus.
const MATRIX_XRAY_COLOR = 0x39ff14;
const MATRIX_FOCUS_COLOR = 0x38bdf8;

function isInsideBuilding(
    object,
    building
) {

    let current =
        object;


    while (current) {

        if (
            current ===
            building
        ) {

            return true;
        }


        current =
            current.parent;
    }


    return false;
}


function applyMatrixXray(
    focusBuilding
) {

    restoreMatrixXray();


    if (!focusBuilding) {
        return;
    }


    // Sweep the entire scene — roads, parks, trees,
    // ground, and every other building all turn into
    // green wireframe. Only the focused building's own
    // meshes are left alone (they stay solid).

    scene.traverse(
        object => {

            if (
                !object.isMesh ||
                !object.material
            ) {

                return;
            }


            if (
                isInsideBuilding(
                    object,
                    focusBuilding
                )
            ) {

                return;
            }


            const original =
                object.material;


            const xrayMaterial =
                new THREE.MeshBasicMaterial({

                    color:
                        MATRIX_XRAY_COLOR,

                    wireframe: true,

                    transparent: true,

                    opacity:
                        object === ground
                            ? 0.12
                            : 0.5,

                    depthWrite: false,

                    side: THREE.DoubleSide
                });


            object.material =
                xrayMaterial;


            matrixXrayMeshes.push({
                mesh: object,
                original
            });
        }
    );


    // Tint the grid green and darken the backdrop so
    // the wireframe city reads clearly against it.

    matrixEnvironmentState = {

        gridColor:
            grid.material.color.getHex(),

        gridOpacity:
            grid.material.opacity,

        backgroundColor:
            scene.background.getHex(),

        fogColor:
            scene.fog.color.getHex()
    };


    grid.material.color.setHex(
        MATRIX_XRAY_COLOR
    );

    grid.material.opacity = 0.25;


    scene.background.setHex(
        0x000502
    );

    scene.fog.color.setHex(
        0x000502
    );


    highlightBuilding(
        focusBuilding
    );


    createMatrixXrayShell(
        focusBuilding
    );
}


// ============================================================
// MATRIX X-RAY SHELL
// ============================================================

function createMatrixXrayShell(
    building
) {

    const box =
        new THREE.Box3()
            .setFromObject(
                building
            );


    if (box.isEmpty()) {
        return;
    }


    const size =
        box.getSize(
            new THREE.Vector3()
        );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    const geometry =
        new THREE.BoxGeometry(
            size.x,
            size.y,
            size.z
        );


    const edges =
        new THREE.EdgesGeometry(
            geometry
        );


    geometry.dispose();


    const material =
        new THREE.LineBasicMaterial({
            color: MATRIX_FOCUS_COLOR,
            transparent: true,
            opacity: 0.85
        });


    matrixXrayShell =
        new THREE.LineSegments(
            edges,
            material
        );


    matrixXrayShell.position.copy(
        center
    );


    scene.add(
        matrixXrayShell
    );
}


// ============================================================
// MATRIX FLOOR DETAIL
// ============================================================

function renderMatrixFloor(
    building,
    floorData,
    floorIndex
) {

    const details =
        getElement(
            "matrixDetails"
        );


    if (!details) {
        return;
    }


    const floors =
        building.userData
            .floorsData;


    const floor =
        floors[
            floorIndex
        ];


    if (!floor) {
        return;
    }


    const units =
        floor.units || [];


    details.innerHTML = `

        <div class="matrix-scene">

            <div class="matrix-building">

                <div
                    class="
                        matrix-detail-card
                    "
                >

                    <div
                        class="
                            matrix-detail-title
                        "
                    >
                        Floor
                        ${floor.floor}
                        ULPIN
                    </div>

                    <div
                        class="
                            matrix-detail-value
                        "
                    >
                        ${floor.ulpin}
                    </div>

                </div>

                <div
                    class="
                        matrix-unit-grid
                    "
                >

                    ${units
                        .map(
                            unit => `

                            <div
                                class="
                                    matrix-unit
                                "
                                data-unit-index="
                                    ${unit.userData.unitIndex}
                                "
                            >

                                <div
                                    class="
                                        matrix-unit-name
                                    "
                                >
                                    Unit
                                    ${unit.userData.unit}
                                </div>

                                <div
                                    class="
                                        matrix-unit-ulpin
                                    "
                                >
                                    ${unit.userData.ulpin}
                                </div>

                            </div>
                        `
                        )
                        .join("")}

                </div>

            </div>

        </div>
    `;


    const unitButtons =
        details.querySelectorAll(
            ".matrix-unit"
        );


    unitButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset
                                .unitIndex
                        );


                    const unit =
                        units.find(
                            item =>
                                item.userData
                                    .unitIndex ===
                                index
                        );


                    if (unit) {

                        selectMatrixUnit(
                            unit,
                            floor
                        );
                    }
                }
            );
        }
    );
}


// ============================================================
// MATRIX UNIT SELECTION
// ============================================================

function selectMatrixUnit(
    unit,
    floorData
) {

    if (!unit) {
        return;
    }


    const details =
        getElement(
            "matrixDetails"
        );


    if (!details) {
        return;
    }


    const data =
        unit.userData;


    details.innerHTML = `

        <div class="matrix-scene">

            <div class="matrix-building">

                <div
                    class="
                        matrix-detail-card
                    "
                >

                    <div
                        class="
                            matrix-detail-title
                        "
                    >
                        Selected Property Unit
                    </div>

                    <div
                        class="
                            matrix-detail-value
                        "
                    >
                        Unit ${data.unit}
                    </div>

                </div>

                <div
                    class="
                        matrix-detail-card
                    "
                >

                    <div
                        class="
                            matrix-detail-title
                        "
                    >
                        3D ULPIN
                    </div>

                    <div
                        class="
                            matrix-detail-value
                        "
                    >
                        ${data.ulpin}
                    </div>

                </div>

                <div
                    class="
                        matrix-detail-card
                    "
                >

                    <div
                        class="
                            matrix-detail-title
                        "
                    >
                        Property Hierarchy
                    </div>

                    <div
                        class="
                            matrix-detail-value
                        "
                    >
                        ${data.buildingId}
                        →
                        F${data.floor}
                        →
                        Unit ${data.unit}
                    </div>

                </div>

                <div
                    class="
                        matrix-detail-card
                    "
                >

                    <div
                        class="
                            matrix-detail-title
                        "
                    >
                        Area
                    </div>

                    <div
                        class="
                            matrix-detail-value
                        "
                    >
                        ${data.area}
                    </div>

                </div>

                <button
                    class="
                        inspect-button
                    "
                    id="matrixBackFloor"
                >
                    ← Back to Floor
                </button>

            </div>

        </div>
    `;


    const backButton =
        getElement(
            "matrixBackFloor"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {

                const floorIndex =
                    (
                        floorData
                            .floor - 1
                    );

                renderMatrixFloor(
                    data.building,
                    floorData,
                    floorIndex
                );
            }
        );
    }
}


// ============================================================
// MATRIX CAMERA FOCUS
// ============================================================

function focusOnBuilding(
    building
) {

    if (!matrixFocusState) {

        matrixFocusState = {

            wasFirstPerson:
                firstPersonMode,

            cameraPosition:
                camera.position.clone(),

            orbitTarget:
                orbitControls.target.clone()
        };
    }


    if (firstPersonMode) {

        if (
            firstPersonControls.isLocked
        ) {

            firstPersonControls.unlock();
        }


        firstPersonMode =
            false;


        movement.forward =
            false;

        movement.backward =
            false;

        movement.left =
            false;

        movement.right =
            false;

        movement.sprint =
            false;


        document.body.classList.remove(
            "fps-active"
        );


        const crosshair =
            getElement(
                "fps-crosshair"
            );


        if (crosshair) {

            crosshair.style.display =
                "none";
        }


        const targetPanel =
            getElement(
                "targetPanel"
            );


        if (targetPanel) {

            targetPanel.classList.remove(
                "active"
            );
        }


        removeTargetOutline();
    }


    orbitControls.enabled =
        true;


    const box =
        new THREE.Box3()
            .setFromObject(
                building
            );


    if (box.isEmpty()) {
        return;
    }


    const size =
        box.getSize(
            new THREE.Vector3()
        );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    const maxDim =
        Math.max(
            size.x,
            size.y,
            size.z
        );


    const distance =
        maxDim * 1.9 + 6;


    orbitControls.target.copy(
        center
    );


    camera.position.set(
        center.x + distance * 0.65,
        center.y + distance * 0.55,
        center.z + distance * 0.65
    );


    orbitControls.update();
}


function restoreFocusState() {

    if (!matrixFocusState) {
        return;
    }


    orbitControls.target.copy(
        matrixFocusState.orbitTarget
    );


    camera.position.copy(
        matrixFocusState.cameraPosition
    );


    orbitControls.update();


    if (
        matrixFocusState.wasFirstPerson
    ) {

        enterFirstPerson();
    }


    matrixFocusState =
        null;
}


// ============================================================
// OPEN MATRIX
// ============================================================

function openMatrix(
    building
) {

    if (!building) {
        return;
    }


    createMatrixOverlay();


    const overlay =
        getElement(
            "matrixOverlay"
        );


    const title =
        getElement(
            "matrixTitle"
        );


    const ulpin =
        getElement(
            "matrixULPIN"
        );


    const floorsContainer =
        getElement(
            "matrixFloors"
        );


    if (!overlay) {
        return;
    }


    selectedBuilding =
        building;


    matrixModeActive =
        true;


    matrixFocusBuilding =
        building;


    if (title) {

        title.textContent =
            `3D Property Matrix · ${
                building.userData
                    .buildingId
            }`;
    }


    if (ulpin) {

        ulpin.textContent =
            building.userData
                .ulpin;
    }


    applyMatrixXray(
        building
    );


    focusOnBuilding(
        building
    );


    overlay.classList.add(
        "active"
    );


    if (
        floorsContainer
    ) {

        floorsContainer.innerHTML =
            "";


        const floors =
            building.userData
                .floorsData || [];


        floors.forEach(
            (
                floor,
                index
            ) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "matrix-floor";


                if (
                    index ===
                    0
                ) {

                    button.classList.add(
                        "active"
                    );
                }


                button.innerHTML = `

                    <div
                        class="
                            matrix-floor-number
                        "
                    >
                        Floor
                        ${floor.floor}
                    </div>

                    <div
                        class="
                            matrix-floor-ulpin
                        "
                    >
                        ${floor.ulpin}
                    </div>
                `;


                button.addEventListener(
                    "click",
                    () => {

                        floorsContainer
                            .querySelectorAll(
                                ".matrix-floor"
                            )
                            .forEach(
                                item =>
                                    item.classList
                                        .remove(
                                            "active"
                                        )
                            );


                        button.classList.add(
                            "active"
                        );


                        renderMatrixFloor(
                            building,
                            floor,
                            index
                        );
                    }
                );


                floorsContainer.appendChild(
                    button
                );
            }
        );


        if (
            floors.length
        ) {

            renderMatrixFloor(
                building,
                floors[0],
                0
            );
        }
    }
}


// ============================================================
// CLOSE MATRIX
// ============================================================

function closeMatrix() {

    matrixModeActive =
        false;


    matrixFocusBuilding =
        null;


    const overlay =
        getElement(
            "matrixOverlay"
        );


    if (overlay) {

        overlay.classList.remove(
            "active"
        );
    }


    restoreMatrixXray();


    restoreFocusState();
}


// ============================================================
// VIEW MODE BUTTONS
// ============================================================

function setupViewModes() {

    const overviewMode =
        getElement(
            "overviewMode"
        );


    const streetMode =
        getElement(
            "streetMode"
        );


    if (overviewMode) {

        overviewMode.addEventListener(
            "click",
            () => {

                enterOverview();
            }
        );
    }


    if (streetMode) {

        streetMode.addEventListener(
            "click",
            () => {

                enterFirstPerson();
            }
        );
    }
}


setupViewModes();


// ============================================================
// ENTER OVERVIEW
// ============================================================

function enterOverview() {

    firstPersonMode =
        false;


    if (
        firstPersonControls.isLocked
    ) {

        firstPersonControls.unlock();
    }


    orbitControls.enabled =
        true;


    movement.forward =
        false;

    movement.backward =
        false;

    movement.left =
        false;

    movement.right =
        false;

    movement.sprint =
        false;


    document.body.classList.remove(
        "fps-active"
    );


    const crosshair =
        getElement(
            "fps-crosshair"
        );


    if (crosshair) {

        crosshair.style.display =
            "none";
    }


    const targetPanel =
        getElement(
            "targetPanel"
        );


    if (targetPanel) {

        targetPanel.classList.remove(
            "active"
        );
    }


    firstPersonTarget =
        null;


    firstPersonTargetType =
        null;


    removeTargetOutline();


    if (
        overviewMode
    ) {

        overviewMode.classList.add(
            "active"
        );
    }


    if (
        streetMode
    ) {

        streetMode.classList.remove(
            "active"
        );
    }
}


// ============================================================
// ENTER FIRST PERSON
// ============================================================

function enterFirstPerson() {

    firstPersonMode =
        true;


    orbitControls.enabled =
        false;


    camera.position.y =
        2.2;


    createFirstPersonHUD();


    const crosshair =
        getElement(
            "fps-crosshair"
        );


    if (crosshair) {

        crosshair.style.display =
            "block";
    }


    document.body.classList.add(
        "fps-active"
    );


    if (
        overviewMode
    ) {

        overviewMode.classList.remove(
            "active"
        );
    }


    if (
        streetMode
    ) {

        streetMode.classList.add(
            "active"
        );
    }


    const streetHelp =
        getElement(
            "street-help"
        );


    if (streetHelp) {

        streetHelp.style.display =
            "block";
    }


    firstPersonControls.lock();
}


// ============================================================
// RESET CAMERA
// ============================================================

function resetScene() {

    closeMatrix();


    clearHighlights();


    selectedBuilding =
        null;

    selectedFloor =
        null;

    selectedUnit =
        null;


    enterOverview();


    camera.position.set(
        65,
        55,
        65
    );


    orbitControls.target.set(
        0,
        5,
        0
    );


    orbitControls.update();
}


// ============================================================
// RESET BUTTON
// ============================================================

const resetButton =
    getElement(
        "resetButton"
    );


if (resetButton) {

    resetButton.addEventListener(
        "click",
        resetScene
    );
}


// ============================================================
// FULLSCREEN
// ============================================================

const fullscreenButton =
    getElement(
        "fullscreen"
    );


if (fullscreenButton) {

    fullscreenButton.addEventListener(
        "click",
        () => {

            if (
                !document.fullscreenElement
            ) {

                document.documentElement
                    .requestFullscreen();

            } else {

                document.exitFullscreen();
            }
        }
    );
}


// ============================================================
// LAYER TOGGLES
// ============================================================

function setupLayerToggle(
    id,
    callback
) {

    const element =
        getElement(
            id
        );


    if (!element) {
        return;
    }


    element.addEventListener(
        "change",
        () => {

            callback(
                element.checked
            );
        }
    );
}


setupLayerToggle(
    "buildingToggle",
    visible => {

        buildings.forEach(
            building => {

                building.visible =
                    visible;
            }
        );
    }
);


setupLayerToggle(
    "roadToggle",
    visible => {

        scene.traverse(
            object => {

                if (
                    object.userData &&
                    object.userData
                        .isRoad
                ) {

                    object.visible =
                        visible;
                }
            }
        );
    }
);


setupLayerToggle(
    "parcelToggle",
    visible => {

        buildings.forEach(
            building => {

                building.traverse(
                    object => {

                        if (
                            object.isLine
                        ) {

                            object.visible =
                                visible;
                        }
                    }
                );
            }
        );
    }
);


setupLayerToggle(
    "greenToggle",
    visible => {

        scene.traverse(
            object => {

                if (
                    object.userData &&
                    object.userData
                        .isGreen
                ) {

                    object.visible =
                        visible;
                }
            }
        );
    }
);


// ============================================================
// MARK ROAD / GREEN OBJECTS
// ============================================================

scene.traverse(
    object => {

        if (
            object.isMesh &&
            object !== ground
        ) {

            if (
                object.geometry &&
                object.geometry.type ===
                "BoxGeometry"
            ) {

                const size =
                    new THREE.Vector3();


                object.geometry
                    .computeBoundingBox();


                if (
                    object.geometry
                        .boundingBox
                ) {

                    object.geometry
                        .boundingBox
                        .getSize(
                            size
                        );


                    if (
                        size.y <
                        0.5
                    ) {

                        object.userData
                            .isRoad =
                            true;
                    }
                }
            }
        }
    }
);


// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


// ============================================================
// ANIMATION LOOP
// ============================================================

let previousTime =
    performance.now();


function animate() {

    requestAnimationFrame(
        animate
    );


    const currentTime =
        performance.now();


    const delta =
        Math.min(
            (
                currentTime -
                previousTime
            ) / 1000,
            0.05
        );


    previousTime =
        currentTime;


    if (
        firstPersonMode
    ) {

        updateFirstPersonMovement(
            delta
        );

        updateTargetDetection();

    } else {

        orbitControls.update();
    }


    if (
        targetOutline
    ) {

        targetOutline.box
            .setFromObject(
                firstPersonTarget
            );
    }


    renderer.render(
        scene,
        camera
    );
}


// ============================================================
// INITIALIZATION
// ============================================================

createFirstPersonHUD();

enterOverview();

animate();

window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'resetView') {
        if (typeof resetScene === 'function') {
            resetScene();
        }
    }
});