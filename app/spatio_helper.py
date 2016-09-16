from pyspatiotemporalgeom import region as region_logic
import copy


def process_polygons(data):
    """
    We now need to structure a data set that pyspatiotemporalgeom can parse.
    This is done by interacting through the coordinates and creating a 2D list.
    Where this list is the coordinates (x, y) of a line. This list is appended
    to another list. This proccess continues util the polygon is complete.
    Argument:
        data, dictionary of JSON data

    Returns:
        an ordered list of half segments with valid labels.
    """
    seg_list = []
    coord_matrix = [[0 for j in range(2)] for i in range(2)]
    for i in range(len(data)):
        coord_matrix[0][0] = data[i].get("lat")
        coord_matrix[0][1] = data[i].get("lng")
        # If not last segment, else complete the shape
        if len(data) > i + 1:
            coord_matrix[1][0] = data[i + 1].get("lat")
            coord_matrix[1][1] = data[i + 1].get("lng")
        else:
            coord_matrix[1][0] = data[0].get("lat")
            coord_matrix[1][1] = data[0].get("lng")
        # Need to make a copy of the list. Else each element in seg_list will
        # be the last coord_matrix data set.
        seg_list.append(copy.deepcopy(coord_matrix))
    return region_logic.createRegionFromSegs(seg_list)


def process_intersections(regions):
    """
    Iterates through the given regions. If there is an intersection
    between those two regions. That intersection is then used as the next
    region to be used to compare aganist the next region in the list. If there
    is no intersection then there is no common intersection and it is done.

    Arguments:
        regions: a list of regions to find a common intersection.

    Returns:
        An intersection in region form.
    """
    # This will be used to start the matching
    region = regions[0].get("region")
    # Compare with the reset of the regions
    for other_region in regions[1:]:
        region = region_logic.intersection(region, other_region.get("region"))
        # If region is not empty, then there was an intersection.
        if not region:
            return []
    return region


def process_unions(regions):
    """
    Iterates through each region and gets the next region in the list to check
    for unions. If there is unions between the two regions a
    dictionary is created. This dictionary holds the first region's ID and the
    union path coordinates.

    Returns:
        A list of union dictionaries.
    """
    unions = []
    visited_regions = []
    for region in regions:
        visited_regions.append(region)
        for other_region in regions:
            if other_region not in visited_regions:
                union = {
                    "region_id": region.get("id"),
                    "other_region": other_region.get("id"),
                    "union": region_logic.union(
                        region.get("region"), other_region.get("region"))
                }
                unions.append(union)
    return unions


def hseg_to_coords(hseg):
    """
    Iterates through the hseg and pulls out unique coordinates.

    Returns:
        A list of dictionary of coordinates.
    """
    unique_cords = []
    for seg in hseg:
        if seg[0][0] not in unique_cords:
            unique_cords.append(seg[0][0])
        if seg[0][1] not in unique_cords:
            unique_cords.append(seg[0][1])
    lat_lng = []
    for cord in unique_cords:
        lat_lng.append({"lat": cord[0], "lng": cord[1]})
    return lat_lng
