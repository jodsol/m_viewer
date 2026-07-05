#pragma once

#include "core/math/Vector3.h"

struct AABB {
    Vector3 min;
    Vector3 max;
    bool initialized = false;

    void expand(const Vector3& point);
};

using BoundingBox = AABB;
