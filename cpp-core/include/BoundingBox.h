#pragma once

#include "Vector3.h"

struct BoundingBox {
    Vector3 min;
    Vector3 max;
    bool initialized = false;

    void expand(const Vector3& point);
};
