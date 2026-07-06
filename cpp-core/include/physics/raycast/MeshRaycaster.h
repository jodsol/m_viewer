#pragma once

#include "geometry/Mesh.h"
#include "physics/raycast/Ray.h"
#include "physics/raycast/RaycastHit.h"

class MeshRaycaster {
public:
    RaycastHit raycast(const Mesh& mesh, const Ray& ray) const;
};
