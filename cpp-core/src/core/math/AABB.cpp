#include "core/math/AABB.h"

void AABB::expand(const Vector3& point) {
    if (!initialized) {
        min = point;
        max = point;
        initialized = true;
        return;
    }

    if (point.x < min.x) min.x = point.x;
    if (point.y < min.y) min.y = point.y;
    if (point.z < min.z) min.z = point.z;
    if (point.x > max.x) max.x = point.x;
    if (point.y > max.y) max.y = point.y;
    if (point.z > max.z) max.z = point.z;
}
