#pragma once

#include "core/math/Vector3.h"

struct RaycastHit {
    bool hit = false;
    Vector3 position;
    int triangleIndex = -1;
    double distance = 0.0;
};
